/**
 * The Runs store. Contains a list of all Runs the user and their friends have made.
 */
Ext.define('testS.store.FenceLists', {
    extend  : 'Ext.data.Store',
	xtype: 'FenceLists',
	fields: [
	            { name: 'renderText',  type: 'string' },
	        ],
    config: {
        autoLoad: true,
    },
});
