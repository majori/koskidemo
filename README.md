# Koskiotus

IoT-application which were used at [TUT](http://www.tut.fi/en/home)'s "Teekkarikaste". Currently capable of measuring dipping baskets depth, temperature and time in the rapids and sharing the data with the audience via HTTP-server. The whole application is written in Javascript. Demo view of the browser app behind [this link](http://majori.github.io/koskiotus/server/public/index.html).

The measuring system was implemented using Intel Edisons with ultrasonic depth sensors and digital temperature sensors.

Aamulehti [article](https://www.aamulehti.fi/kotimaa/teekkareita-on-kastettu-50-vuotta-jaakylmaan-veteen-nyt-mitataan-ketka-kestavat-pisimpaan-23621762/) about the project.

## Tech Stack
* [NodeJS](https://nodejs.org/)
* [SQLite](https://www.sqlite.org/)
* [Socket.IO](http://socket.io/)
* [Johnny-Five](https://github.com/rwaldron/johnny-five)
