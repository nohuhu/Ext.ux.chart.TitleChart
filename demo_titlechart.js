/*
    Title Chart demo page.

    Copyright (C) 2011 Alexander Tokarev.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

Ext.onReady(function () {
    var panel, chart, legend,
        title = 'Ain\'t it cool to have a Title?',
        store = Ext.create('Ext.data.Store', {
        fields: [ 'name', 'data' ],
        data: [
            { name: 'Field 0',  data: Math.random() * 100 },
            { name: 'Field 1',  data: Math.random() * 100 },
            { name: 'Field 2',  data: Math.random() * 100 },
            { name: 'Field 3',  data: Math.random() * 100 },
            { name: 'Field 4',  data: Math.random() * 100 },
            { name: 'Field 5',  data: Math.random() * 100 },
            { name: 'Field 6',  data: Math.random() * 100 },
            { name: 'Field 7',  data: Math.random() * 100 },
            { name: 'Field 8',  data: Math.random() * 100 },
            { name: 'Field 9',  data: Math.random() * 100 },
            { name: 'Field 10', data: Math.random() * 100 },
            { name: 'Field 11', data: Math.random() * 100 },
            { name: 'Field 12', data: Math.random() * 100 }
        ]
    });
    
    var buttonHandler = function(button, object) {
        var positions = { '&larr;': 'left', '&uarr;': 'top', '&rarr;': 'right', '&darr;': 'bottom' };
        
        switch ( object ) {
        case 'legend':
            if ( positions[button.text] ) {
                legend.position   = positions[button.text];
                legend.isVertical = !!("left|right".indexOf(legend.position) !== -1);
                chart.legend      = legend;
                legend.show && legend.show();
            }
            else {
                legend.hide && legend.hide();
                chart.legend = false;
            };
            break;
        case 'title':
            if ( positions[button.text] ) {
                chart.title = title;
                chart.titleLocation = positions[button.text];
            }
            else {
                chart.title = false;
            };
        };
        
        chart.redraw();
    };

    panel = Ext.create('widget.panel', {
        width: 450,
        height: 400,
        position: 'absolute',
        x: 100,
        y: 100,
        title: 'Title Chart demo',
        renderTo: Ext.getBody(),
        layout: 'fit',
        tbar: [{
            xtype: 'tbtext',
            text:  'Move Title:'
        }, {
            xtype: 'tbseparator'
        }, {
            text: '&larr;',
            handler: Ext.bind(buttonHandler, panel, [ 'title' ], 1)
        }, {
            text: '&uarr;',
            handler: Ext.bind(buttonHandler, panel, [ 'title' ], 1)
        }, {
            text: '&darr;',
            handler: Ext.bind(buttonHandler, panel, [ 'title' ], 1)
        }, {
            text: '&rarr;',
            handler: Ext.bind(buttonHandler, panel, [ 'title' ], 1)
        }, {
            text: '&otimes;',
            handler: Ext.bind(buttonHandler, panel, [ 'title' ], 1)
        }, {
            xtype: 'tbseparator'
        }, {
            xtype: 'tbtext',
            text:  '&nbsp;'
        }, {
            hideLabel: true,
            id: 'titleFontText',
            xtype: 'textfield',
            width: 120,
            emptyText: 'CSS font:',
            listeners: {
                specialkey: function(field, event){
                    if (event.getKey() === event.ENTER) {
                        Ext.getCmp('titleFontButton').handler();
                    }
                }
            }
        }, {
            id: 'titleFontButton',
            text: 'Set font',
            handler: function(){
                chart.titleFont = Ext.getCmp('titleFontText').getValue();
                chart.redraw();
            }
        }],
        items: {
            xtype: 'titlechart',
            title: title,
            titleFont: 'bold 16px sans-serif',
            titlePadding: 5,
            titleMargin: 5,
            insetPadding: 5,
            id: 'chart',
            animate: Ext.isIE ? false : true,
            store: store,
            shadow: Ext.isIE ? false : true,
            legend: false,
            theme: 'Base:gradients',
            series: [{
                type: 'pie',
                field: 'data',
                showInLegend: true,
                label: {
                    display: 'rotate',
                    contrast: true
                }
            }]
        }
    });
    
    chart = panel.down('chart');

    chart.redraw();
});
