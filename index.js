/* Připojení modulu frameworku Express */
const express = require("express");
/* Připojení externího modulu body-parser (https://www.npmjs.com/package/body-parser) -
middleware pro parsování těla požadavku */
const bodyParser = require("body-parser");
/* Připojení externího modulu moment (https://momentjs.com/) - knihovna pro formátování 
datových a časových údajů */
const moment = require("moment");
/* Připojení externího modulu csvtojson (https://www.npmjs.com/package/csvtojson) -knihovna usnadňující načtení dat z CSV do formátu JSON */
const csvtojson = require('csvtojson');
/* Připojení vestavěných modulů fs (práce se soubory) a path (cesty v adresářové struktuře) */
const fs = require("fs");
const path = require("path");
/* Vytvoření základního objektu serverové aplikace */
const app = express();
/* Nastavení portu, na němž bude spuštěný server naslouchat */
const port = 3000;
/* Identifikace složky obsahující statické soubory klientské části webu */
app.use(express.static("public"));
app.use(express.static("resources"));
/* Nastavení typu šablonovacího engine na pug*/
app.set("view engine", "pug");
/* Nastavení složky, kde budou umístěny šablony pug */
app.set("views", path.join(__dirname, "views"))
/* Využití modulu body-parser pro parsování těla požadavku */
const urlencodedParser = bodyParser.urlencoded({ extended: false });
/* Ošetření požadavku poslaného metodou POST na adresu <server>/savedataUkládá data poslaná z webového formuláře do souboru CSV */
app.post('/savedata', urlencodedParser, (req, res) => {
    let str = `"${req.body.datum}","${req.body.cas}","${req.body.teplota}°C","${req.body.oblacnost}","${req.body.vlhkost}%","${req.body.srazky}mm"\n`;
    /* Pomocí modulu fs a metody appendFile dojde k přidání připraveného řádku (proměnná str) do uvedeného souboru */
    fs.appendFile(path.join(__dirname, 'data/zaznamy.csv'), str, function (err) {
        /* Když byla zaznamenána chyba při práci se souborem */
        if (err) {
            /* Vypsání chyby do konzole NodeJS (na serveru). */
            console.error(err);
            /* Odpovědí serveru bude stavová zpráva 400 a v hlavičce odpovědi budou odeslány upřesňující informace. */
            returnres.status(400).json({ success: false, message: "Nastala chyba během ukládání souboru" });
        }
    });
    /* Přesměrování na úvodní stránku serverové aplikace včetně odeslání stavové zprávy 301. */
    res.redirect(301, '/');
});
app.get("/pocasi", (req, res) => {
    csvtojson({ headers: ['datum', 'cas', 'teplota', 'oblacnost', 'vlhkost', 'srazky'] }).fromFile(path.join(__dirname, 'data/zaznamy.csv'))
        .then(data => {
            res.render('index', { nadpis: "Počasí", pocasi: data });
        }).catch(err => {
            /* Vypsání případné chyby do konzole */
            console.log(err);
            /* Vykreslení šablony error.pug s předanými údaji o chybě */
            res.render('error', { nadpis: "Chyba v aplikaci", chyba: err });
        });
});

/* Spuštění webového serveru */
app.listen(port, () => {
    console.log(`Server naslouchá na portu ${port}`);
});
