Ext.define('testS.view.BottomView', {
    extend: 'Ext.Panel',
    xtype: 'BottomView',
    id:'bottomView',
    config: {
        layout:{
          type: 'card',
          animation: 'slide',
        },
        items: [{
                xclass: 'testS.view.Login',
            },
            {
                xclass: 'testS.view.Main',
            },
            {
                xclass: 'testS.view.UsrRgst',
            }
        ]
    }
});
