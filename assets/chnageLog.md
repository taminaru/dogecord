# Package logs

This file contains mostly all the old module names and handlers before switching to dogecord.

_helpful to refer to them later._

## DogeCord Var's changes and file

> client

DogeCord > Akairo

DogeCordClient > [AkairoClient](https://github.com/taminaru/dogecord/blob/stable/src/struct/DogeCordClient.js)

DogeCordOptions > [AkairoOptions](https://github.com/taminaru/dogecord/blob/stable/src/struct/DogeCordClient.js)

DogeCordError > [AkairoError](https://github.com/taminaru/dogecord/blob/stable/src/util/DogeCordError.js)

> handlers

DogeCordHandler > [AkairoHandler](https://github.com/taminaru/dogecord/blob/stable/src/struct/DogeCordHandler.js)

DogeCordHandlerEvents > [AkairoHandlerEvents](https://github.com/taminaru/dogecord/blob/stable/src/struct/DogeCordHandlerEvents.js)

DogeCordHandlerOptions > [AkairoHandlerOptions](https://github.com/taminaru/dogecord/blob/stable/src/index.d.ts)

DogeCordHandler#load > [AkairoHandler#load](https://github.com/taminaru/dogecord/blob/stable/src/struct/DogeCordHandler.js)

> modules

DogeCordModuleOptions > [AkairoModuleOptions](https://github.com/taminaru/dogecord/blob/stable/src/index.d.ts)

DogeCordHandler#remove > [AkairoHandler#remove](https://github.com/taminaru/dogecord/blob/stable/src/struct/DogeCordHandler.js)

DogeCordModule > [AkairoModule](https://github.com/taminaru/dogecord/blob/stable/src/struct/DogeCordModule.js)

## Notes

If the var is not mentioned here then it most likely has not been changed.