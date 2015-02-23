/**
 * The Runs store. Contains a list of all Runs the user and their friends have made.
 */
Ext.define('testS.store.GroupLists', {
    extend  : 'Ext.data.Store',
	xtype: 'GroupLists',
	fields: [
	            { name: 'renderText',  type: 'string' },
	        ],
    config: {
        autoLoad: true,
    },
});
