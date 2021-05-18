# Custom Handlers

### And Custom Modules

Internally, Akairo's handlers all extends DogeCordHandler, and all modules extends DogeCordModule.  
So, you can create your own handlers and module types!  
Create a new class for your module.  

```js
const { DogeCordModule } = require('@taminaru/dogecord');

class CustomModule extends DogeCordModule {
    constructor(id, options = {}) {
        super(id, options);

        this.color = options.color || 'red';
    }

    exec() {
        throw new Error('Not implemented!');
    }
}

module.exports = CustomModule;
```

Note that the `exec` method you see in Command, Inhibitor, and Listener are not native to DogeCordModule.  
They require you to actually create them within the module type, such as above.  
We throw an error there just in case you forget to implement it.  

Then, create a new class for your handler:  

```js
const { DogeCordHandler } = require('@taminaru/dogecord');
const CustomModule = require('./CustomModule');

class CustomHandler extends DogeCordHandler {
    constructor(client, options = {}) {
        super(client, {
            directory: options.directory,
            classToHandle: CustomModule
        });

        this.customOption = options.customOption || 'something';
    }
}

module.exports = CustomHandler;
```

For the handler, the `super()` takes the client, the directory for the handler, and the class of the module type we want to handle.  
Now we can add it to our client if we so desire:  

```js
const { DogeCordClient } = require('@taminaru/dogecord');
const CustomHandler = require('./CustomHandler');

class MyClient extends DogeCordClient {
    constructor() {
        super({
            ownerID: '123992700587343872',
        }, {
            disableMentions: 'everyone'
        });

        this.customHandler = new CustomHandler(this, {
            directory: './customs/'
        });

        this.customHandler.loadAll();
    }
}

module.exports = MyClient;
```

And the module:  

```js
const CustomModule = require('../CustomModule');

class CustomCustom extends CustomModule {
    constructor() {
        super('custom', {
            color: 'blue'
        });
    }

    exec() {
        console.log('I did something!');
    }
}

module.exports = CustomCustom;
```

Custom handlers and modules are can get much more complicated than this.  
However, it would be out of the scope of this tutorial, so if you want to go there, check out the source code on Github.  
