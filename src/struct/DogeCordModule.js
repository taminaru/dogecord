/**
 * Base class for a module.
 * @param {string} id - ID of module.
 * @param {DogeCordModuleOptions} [options={}] - Options.
 */
class DogeCordModule {
    constructor(id, { category = 'default' } = {}) {
        /**
         * ID of the module.
         * @type {string}
         */
        this.id = id;

        /**
         * ID of the category this belongs to.
         * @type {string}
         */
        this.categoryID = category;

        /**
         * Category this belongs to.
         * @type {Category}
         */
        this.category = null;

        /**
         * The filepath.
         * @type {string}
         */
        this.filepath = null;

        /**
         * The Doge client.
         * @type {DogeCordClient}
         */
        this.client = null;

        /**
         * The handler.
         * @type {DogeCordHandler}
         */
        this.handler = null;
    }

    /**
     * Reloads the module.
     * @returns {DogeCordModule}
     */
    reload() {
        return this.handler.reload(this.id);
    }

    /**
     * Removes the module.
     * @returns {DogeCordModule}
     */
    remove() {
        return this.handler.remove(this.id);
    }

    /**
     * Returns the ID.
     * @returns {string}
     */
    toString() {
        return this.id;
    }
}

module.exports = DogeCordModule;

/**
 * Options for module.
 * @typedef {Object} DogeCordModuleOptions
 * @prop {string} [category='default'] - Category ID for organization purposes.
 */
