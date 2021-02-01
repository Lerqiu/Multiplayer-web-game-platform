let UserCookie = require('./UserCookie');
let Users = require('./Users');
let express = require('express');
let http = require('http');


/**
* Inicjalizacja strony logowania
* @param {express.Express} app Obiekt express
* @param {Users} users Moduł users
* 
*/
module.exports = function (app, users) {

    /**
    * Obsługa formularzu logowania (lub wejścia anonimowego [bez hasła])
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    * @param {*} next
    */
    function login(req, res, next) {
        let mode = req.body.mode;//wejście anonimowe lub logowanie
        var password = req.body.password;
        var nick = req.body.nick;
        if (mode === 'anonymous') {
            if (!users.hasUser(nick)) {
                res.cookie('user', UserCookie.MakeAnonymous(nick).stringify(), { signed: true });
                next();
            } else {
                res.render("login/index.ejs", { loginError: "", loginAnonymousError: `Nick: ${req.body.nick} jest już zajęty.` });
            }
        } else if (mode === 'registering') {
            users.areLoginDataCorrect(nick, password).then(result => {
                if (result) {
                    res.cookie('user', UserCookie.MakeRegistered(nick).stringify(), { signed: true });
                    next();
                }
                else {
                    res.render("login/index.ejs", { loginError: "Niepoprawne login lub hasło.", loginAnonymousError: "" });
                }
            })
        } else {
            res.redirect(req.url)
        }
    }

    /**
    * Wylogowanie(POST)
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    * @param {*} next
    */
    function logout(req, res, next) {
        res.cookie('user', "", { signed: true, maxAge: -1 });
        res.redirect('/');
    }


    /**
    * Rejestracja nowego użytkownika (GET)
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    * @param {*} next
    */
    function register_get(req, res, next) {
        let cookie = req.signedCookies.user;
        if (cookie) {
            let user = UserCookie.Parse(cookie);
            if (user.isRegistered()) {
                res.render("login/register.ejs", { registerError: "", nick: user.getNick() });
            } else {
                res.render("login/register.ejs", { registerError: "Jesteś obecnie zalogowany jako anonimowy użytkownik. Rejestracja umożliwi ci dostęp do statystyk.", nick: user.getNick() });
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
        let nick = req.body.nick;
        let password = req.body.password;
        if (!users.hasUser(nick)) {
            res.cookie('user', UserCookie.MakeRegistered(nick).stringify(), { signed: true });
            users.addNew(nick, password).then(result => {
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
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    * @param {*} next
    */
    function resetAnonymous(req, res, next) {
        let cookie = req.signedCookies.user;
        if (cookie) {
            let user = UserCookie.Parse(cookie);
            if (user.isAnonymous()) {
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
    * Sprawdzenie czy użytkownik jest zalogowany lub w trybie anonimowym
    * @param {http.IncomingMessage} req
    * @param {http.ServerResponse} res
    * @param {*} next
    */
    function authorize(req, res, next) {
        let cookie = req.signedCookies.user;
        if (cookie) {
            req.user = UserCookie.Parse(cookie);
            next();
        } else {
            res.redirect('/');
        }
    }

    /**
    * Zainicjowanie strony główniej (logowanie/rejestracja itp.)
    */
    (function () {
        app.get('/', resetAnonymous, (req, res) => {
            res.render("login/index.ejs", { loginError: "", loginAnonymousError: "" });
        });

        app.post('/', login, nextLocation);

        app.get("/register", register_get);

        app.post('/register', register, nextLocation);

        app.post('/logout', logout);
    })()

    //Z pewnością przyda nam się możliwość rozpoznania trybu użytkownika oraz zapewnienie że użytkownik jest zalogowany w pozostałych modułach
    return authorize;

}
