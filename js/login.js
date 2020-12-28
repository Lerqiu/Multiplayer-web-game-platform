var bcrypt = require('bcrypt');

let users = {}
//Para login:hasło

//Szablon ciastka 
// {
//     login: "Alek308",
//     mode:"registered" or "anonymous",
// }

/**
* Podanie nicku (POST) "określenie własnego identyfikatora (nicka)"
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function login_anonymous(req, res, next) {
    if (!users[req.body.nick]) {
        res.cookie('user', JSON.stringify({ nick: req.body.nick, mode: "anonymous" }), { signed: true });
        next();
    } else {
        res.render("login/index.ejs", { loginError: "", loginAnonymousError: `Nick: ${req.body.nick} jest już zajęty.` });
    }
}


/**
* Zalogowanie (POST)"możliwość zalogowania się"
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function login(req, res, next) {
    var password = req.body.password;
    var rounds = 12;
    if (users[req.body.nick])
        (async function () {
            var hash = await bcrypt.hash(password, rounds);
            var result = await bcrypt.compare(users[req.body.nick], hash);

            if (result) {
                res.cookie('user', JSON.stringify({ login: req.body.nick, mode: "registered" }), { signed: true });
                next();
            }
            else {
                res.render("login/index.ejs", { loginError: "Niepoprawne hasło.", loginAnonymousError: "" });
            }
        })()
    else
        res.render("login/index.ejs", { loginError: "Brak użytkownika o podanej nazwie.", loginAnonymousError: "" });
}

/**
* Wylogowanie(POST)
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function logout(req, res, next) {
    res.cookie('user', "", { signed: true, maxAge: -1 });
    next();
}


/**
* Rejestracja nowego użytkownika (GET)
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function register_get(req, res, next) {
    if (req.signedCookies.user) {
        let user = JSON.parse(req.signedCookies.user);
        if (user.mode == "anonymous") {
            res.render("login/register.ejs", { registerError: "", nick: user.nick });
        } else {
            res.render("login/register.ejs", { registerError: "Jesteś obecnie zalogowany", nick: user.nick });
        }
    } else {
        res.render("login/register.ejs", { registerError: "", nick: "" });
    }
}


/**
* Rejestracja nowego użytkownika (POST)
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function register(req, res, next) {
    var nick = req.body.nick;
    var password = req.body.password;

    if (!users[nick]) {
        res.cookie('user', JSON.stringify({ login: nick, mode: "registered" }), { signed: true });
        users[nick] = password;
        next();
    } else {
        res.render("login/register.ejs", { registerError: "Użytkownik o takiej nazwie już istnieje.", nick: nick });
    }
}


/**
* Idea. Nie chcemy by użytkownicy zalogowani musieli logować się ponownie.
* Jednak dla użytkowników anonimowych (tylko nick) chcemy by rozpoczynali wejście na stronę od zera.
* Dlatego dla nich nastąpi usunięcie ciasteczka. 
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function resetAnonymous(req, res, next) {
    if (req.signedCookies.user) {
        let user = JSON.parse(req.signedCookies.user);
        if (user.mode == "anonymous") {
            res.cookie('user', "", { signed: true, maxAge: -1 });
            res.redirect(req.url)
        } else {
            return nextLocation(req, res, next);
        }
    }
    next();
}


/**
* Następna odwiedzana lokalizacja
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
function nextLocation(req, res, next) {
    res.redirect("rooms");
}


/**
* Zainicjowanie strony główniej (logowanie/rejestracja itp.)
*/
module.exports.addLogin = function(app) {
    app.get('/', resetAnonymous, (req, res) => {
        console.log(`Query 0: ${req.query.returnUrl}`);
        res.render("login/index.ejs", { loginError: "", loginAnonymousError: "" });
    });

    app.get("/register", register_get);

    app.post('/register', register, nextLocation);

    app.post('/login_anonymous', login_anonymous, nextLocation);

    app.post('/login', login, nextLocation);

    app.post('/logout', logout,nextLocation);
}


/**
* Sprawdza czy istnieje odpowiednie ciastko sesyjne. Jeżeli nie następuje przekierowanie. Stosowane w każdym żądaniu poza pierwszym logowaniu.
* @param {http.IncomingMessage} req
* @param {http.ServerResponse} res
* @param {*} next
*/
module.exports.authorize = function authorize(req, res, next) {
    if (req.signedCookies.user) {
        req.user = JSON.parse(req.signedCookies.user);
        next();
    } else {
        res.redirect('/');
    }
}