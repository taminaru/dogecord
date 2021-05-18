const DogeCordError = require('../util/DogeCordError');
const { DogeCordHandlerEvents } = require('../util/Constants');
const DogeCordModule = require('./DogeCordModule');
const Category = require('../util/Category');
const { Collection } = require('discord.js');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/**
 * Base class for handling modules.
 * @param {DogeCordClient} client - The Akairo client.
 * @param {DogeCordHandlerOptions} options - Options for module loading and handling.
 * @extends {EventEmitter}
 */
class DogeCordHandler extends EventEmitter {
    constructor(client, {
        directory,
        classToHandle = DogeCordModule,
        extensions = ['.js', '.json', '.ts'],
        automateCategories = false,
        loadFilter = (() => true)
    }) {
        super();

        /**
         * The Akairo client.
         * @type {DogeCordClient}
         */
        this.client = client;

        /**
         * The main directory to modules.
         * @type {string}
         */
        this.directory = directory;

        /**
         * Class to handle.
         * @type {Function}
         */
        this.classToHandle = classToHandle;

        /**
         * File extensions to load.
         * @type {Set<string>}
         */
        this.extensions = new Set(extensions);

        /**
         * Whether or not to automate category names.
         * @type {boolean}
         */
        this.automateCategories = Boolean(automateCategories);

        /**
         * Function that filters files when loading.
         * @type {LoadPredicate}
         */
        this.loadFilter = loadFilter;

        /**
         * Modules loaded, mapped by ID to DogeCordModule.
         * @type {Collection<string, DogeCordModule>}
         */
        this.modules = new Collection();

        /**
         * Categories, mapped by ID to Category.
         * @type {Collection<string, Category>}
         */
        this.categories = new Collection();
    }

    /**
     * Registers a module.
     * @param {DogeCordModule} mod - Module to use.
     * @param {string} [filepath] - Filepath of module.
     * @returns {void}
     */
    register(mod, filepath) {
        mod.filepath = filepath;
        mod.client = this.client;
        mod.handler = this;
        this.modules.set(mod.id, mod);

        if (mod.categoryID === 'default' && this.automateCategories) {
            const dirs = path.dirname(filepath).split(path.sep);
            mod.categoryID = dirs[dirs.length - 1];
        }

        if (!this.categories.has(mod.categoryID)) {
            this.categories.set(mod.categoryID, new Category(mod.categoryID));
        }

        const category = this.categories.get(mod.categoryID);
        mod.category = category;
        category.set(mod.id, mod);
    }

    /**
     * Deregisters a module.
     * @param {DogeCordModule} mod - Module to use.
     * @returns {void}
     */
    deregister(mod) {
        if (mod.filepath) delete require.cache[require.resolve(mod.filepath)];
        this.modules.delete(mod.id);
        mod.category.delete(mod.id);
    }

    /**
     * Loads a module, can be a module class or a filepath.
     * @param {string|Function} thing - Module class or path to module.
     * @param {boolean} [isReload=false] - Whether this is a reload or not.
     * @returns {DogeCordModule}
     */
    load(thing, isReload = false) {
        const isClass = typeof thing === 'function';
        if (!isClass && !this.extensions.has(path.extname(thing))) return undefined;

        let mod = isClass
            ? thing
            : function findExport(m) {
                if (!m) return null;
                if (m.prototype instanceof this.classToHandle) return m;
                return m.default ? findExport.call(this, m.default) : null;
            }.call(this, require(thing));

        if (mod && mod.prototype instanceof this.classToHandle) {
            mod = new mod(this); // eslint-disable-line new-cap
        } else {
            if (!isClass) delete require.cache[require.resolve(thing)];
            return undefined;
        }

        if (this.modules.has(mod.id)) throw new DogeCordError('ALREADY_LOADED', this.classToHandle.name, mod.id);

        this.register(mod, isClass ? null : thing);
        this.emit(DogeCordHandlerEvents.LOAD, mod, isReload);
        return mod;
    }

    /**
     * Reads all modules from a directory and loads them.
     * @param {string} [directory] - Directory to load from.
     * Defaults to the directory passed in the constructor.
     * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
     * Defaults to the filter passed in the constructor.
     * @returns {DogeCordHandler}
     */
    loadAll(directory = this.directory, filter = this.loadFilter || (() => true)) {
        const filepaths = this.constructor.readdirRecursive(directory);
        for (let filepath of filepaths) {
            filepath = path.resolve(filepath);
            if (filter(filepath)) this.load(filepath);
        }

        return this;
    }

    /**
     * Removes a module.
     * @param {string} id - ID of the module.
     * @returns {DogeCordModule}
     */
    remove(id) {
        const mod = this.modules.get(id.toString());
        if (!mod) throw new DogeCordError('MODULE_NOT_FOUND', this.classToHandle.name, id);

        this.deregister(mod);

        this.emit(DogeCordHandlerEvents.REMOVE, mod);
        return mod;
    }

    /**
     * Removes all modules.
     * @returns {DogeCordHandler}
     */
    removeAll() {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath) this.remove(m.id);
        }

        return this;
    }

    /**
     * Reloads a module.
     * @param {string} id - ID of the module.
     * @returns {DogeCordModule}
     */
    reload(id) {
        const mod = this.modules.get(id.toString());
        if (!mod) throw new DogeCordError('MODULE_NOT_FOUND', this.classToHandle.name, id);
        if (!mod.filepath) throw new DogeCordError('NOT_RELOADABLE', this.classToHandle.name, id);

        this.deregister(mod);

        const filepath = mod.filepath;
        const newMod = this.load(filepath, true);
        return newMod;
    }

    /**
     * Reloads all modules.
     * @returns {DogeCordHandler}
     */
    reloadAll() {
        for (const m of Array.from(this.modules.values())) {
            if (m.filepath) this.reload(m.id);
        }

        return this;
    }

    /**
     * Finds a category by name.
     * @param {string} name - Name to find with.
     * @returns {Category}
     */
    findCategory(name) {
        return this.categories.find(category => {
            return category.id.toLowerCase() === name.toLowerCase();
        });
    }

    /**
     * Reads files recursively from a directory.
     * @param {string} directory - Directory to read.
     * @returns {string[]}
     */
    static readdirRecursive(directory) {
        const result = [];

        (function read(dir) {
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const filepath = path.join(dir, file);

                if (fs.statSync(filepath).isDirectory()) {
                    read(filepath);
                } else {
                    result.push(filepath);
                }
            }
        }(directory));

        return result;
    }
}

module.exports = DogeCordHandler;

/**
 * Emitted when a module is loaded.
 * @event DogeCordHandler#load
 * @param {DogeCordModule} mod - Module loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a module is removed.
 * @event DogeCordHandler#remove
 * @param {DogeCordModule} mod - Module removed.
 */

/**
 * Options for module loading and handling.
 * @typedef {Object} DogeCordHandlerOptions
 * @prop {string} [directory] - Directory to modules.
 * @prop {Function} [classToHandle=DogeCordModule] - Only classes that extends this class can be handled.
 * @prop {string[]|Set<string>} [extensions] - File extensions to load.
 * By default this is .js, .json, and .ts files.
 * @prop {boolean} [automateCategories=false] - Whether or not to set each module's category to its parent directory name.
 * @prop {LoadPredicate} [loadFilter] - Filter for files to be loaded.
 * Can be set individually for each handler by overriding the `loadAll` method.
 */

/**
 * Function for filtering files when loading.
 * True means the file should be loaded.
 * @typedef {Function} LoadPredicate
 * @param {String} filepath - Filepath of file.
 * @returns {boolean}
*/
