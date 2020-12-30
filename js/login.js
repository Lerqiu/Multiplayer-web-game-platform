//Szablon ciastka 
// {
//     login: "Alek308",
//     mode:"registered" or "anonymous",
// }

/**
* Inicjalizacja strony logowania
* @param {*} app Obiekt express
* @param {*} users Moduł users
* 
*/
module.exports = function (app, users) {

    /**
    * Podanie nicku (POST) "określenie własnego identyfikatora (nicka)"
    */
    function login_anonymous(req, res, next) {
        if (!users.exist(req.body.nick)) {
            res.cookie('user', JSON.stringify({ nick: req.body.nick, mode: "anonymous" }), { signed: true });
            next();
        } else {
            res.render("login/index.ejs", { loginError: "", loginAnonymousError: `Nick: ${req.body.nick} jest już zajęty.` });
        }
    }


    /**
    * Zalogowanie (POST)"możliwość zalogowania się"
    */
    function login(req, res, next) {
        var password = req.body.password;
        var nick = req.body.nick;
        //if (users.exist(nick))
            users.isLoginCorrect(nick, password).then(result => {
                if (result) {
                    res.cookie('user', JSON.stringify({ nick: req.body.nick, mode: "registered" }), { signed: true });
                    next();
                }
                else {
                    res.render("login/index.ejs", { loginError: "Niepoprawne login lub hasło.", loginAnonymousError: "" });
                }
            })
        // else {
        //     console.log(JSON.stringify(users.getAll()))
        //     res.render("login/index.ejs", { loginError: `Brak użytkownika o podanej nazwie.`, loginAnonymousError: "" });
        // }
    }

    /**
    * Wylogowanie(POST)
    */
    function logout(req, res, next) {
        res.cookie('user', "", { signed: true, maxAge: -1 });
        next();
    }


    /**
    * Rejestracja nowego użytkownika (GET)
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
    */
    function register(req, res, next) {
        let nick = req.body.nick;
        let password = req.body.password;
        if (!users.exist(nick)) {
            res.cookie('user', JSON.stringify({ nick: nick, mode: "registered" }), { signed: true });
            users.addNewUser(nick, password).then(result => {
                next()
            })
        } else {
            res.render("login/register.ejs", { registerError: "Użytkownik o takiej nazwie już istnieje.", nick: nick });
        }
    }


    /**
    * Idea. Nie chcemy by użytkownicy zalogowani musieli logować się ponownie.
    * Jednak dla użytkowników anonimowych (tylko nick) chcemy by rozpoczynali wejście na stronę od zera.
    * Dlatego dla nich nastąpi usunięcie ciasteczka. 
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
    */
    function nextLocation(req, res, next) {
        res.redirect("rooms");
    }


    /**
    * Zainicjowanie strony główniej (logowanie/rejestracja itp.)
    */
    app.get('/', resetAnonymous, (req, res) => {
        res.render("login/index.ejs", { loginError: "", loginAnonymousError: "" });
    });

    app.get("/register", register_get);

    app.post('/register', register, nextLocation);

    app.post('/login_anonymous', login_anonymous, nextLocation);

    app.post('/login', login, nextLocation);

    app.post('/logout', logout, nextLocation);

    //Z pewnością przyda nam się możliwość rozpoznania trybu użytkownika oraz zapewnienie że użytkownik jest zalogowany w pozostałych modułach
    return {
        authorize: function authorize(req, res, next) {
            if (req.signedCookies.user) {
                req.user = JSON.parse(req.signedCookies.user);
                next();
            } else {
                res.redirect('/');
            }
        },
        registered: function (user) {
            return user.mode == "registered";
        }
    }
}