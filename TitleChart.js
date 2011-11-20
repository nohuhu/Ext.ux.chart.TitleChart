/*
    Ext JS extension that implements a Chart with a repositionable Title.
    
    Version 0.9.
    
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

Ext.define('Ext.ux.chart.TitleChart', {
    extend: 'Ext.ux.chart.Chart',
    alias:  'widget.titlechart',
    
    requires: [ 'Ext.util.Format' ],
    
    /*
     * @cfg {String} Title text for this Chart.
     */
    title: false,
    
    /*
     * @cfg {String} Title location: 'left', 'top', 'right' or 'bottom'. Default is 'top'.
     */
    titleLocation: 'top',
    
    /*
     * @cfg {String} Font to be used for Title, e.g. '12px Helvetica, sans-serif'
     */
    titleFont: '12px Helvetica, sans-serif',
    
    /*
     * @cfg {Int} Padding between Chart border and title, in pixels. Default: 5.
     */
    titlePadding: 5,
    
    /*
     * @cfg {Int} Margin between title and inner space available for Chart, in pixels.
     * Defaults to 0.
     */
    titleMargin: 0,
    
    /**
     * @private
     * Overrides Chart.getInsets() to accommodate for title sprite.
     */
    getInsets: function() {
        var me = this,
            insets;
        
        insets = me.callParent(arguments);
        
        // By the time title Sprite is created, there's already a Surface
        if ( me.titleSprite && me.title !== false ) {
            var edge, titleBBox, offset;
            
            edge      = me.titleLocation;
            titleBBox = me.titleSprite.getBBox();
            offset    = Ext.util.Format.round( titleBBox.height / 4, 0 );
            
            insets[edge] += edge == 'left' || edge == 'right' ? titleBBox.width
                          :                                     titleBBox.height
                          ;
            
            // This gap is to avoid drawing title too close to actual chart body
            insets[edge] += me.titlePadding + me.titleMargin;
        };
        
        return insets;
    },
    
    /**
     * @private
     * Creates Title sprite and adjusts its dimensions and position.
     */
    afterRender: function() {
        var me = this,
            sprite;
            
        me.callParent(arguments);
        
        // Draw the title
        me.drawTitleSprite();
    },
    
    /**
     * @private Draws the title Sprite.
     */
    drawTitleSprite: function() {
        var me = this;

        // Check if we already have the Sprite
        if ( me.titleSprite !== undefined ) {
            me.titleSprite.hide(true);
            me.titleSprite.destroy();
            me.titleSprite = undefined;
        };

        if ( me.title === false ) {
            return;
        };
        
        // Create but don't show yet
        me.titleSprite = me.createTitleSprite();
        
        // Finally, show the Sprite (but don't redraw it yet)
        me.titleSprite.show(true);
    },
    
    /**
     * @private
     * This method instantiates a text Sprite to display Chart title.
     */
    createTitleSprite: function() {
        var me = this,
            sprite;
        
        sprite = Ext.create('Ext.draw.Sprite', {
            type: 'text',
            text: me.title,
            font: me.titleFont,
            x:    0,            // Coordinates will be adjusted after
            y:    0             // placing Sprite on Surface
        });
        
        // Sprite is going to be created after Chart is rendered,
        // therefore Surface should be available already
        me.surface.add(sprite);
        
        // Draw the Sprite momentarily and then hide it again quickly.
        sprite.redraw();
        sprite.hide(true);
        
        var coord = me.calcTitleCoordinates(sprite);
        
        // Now combine attributes to position the Sprite and rotate it if it's vertical
        var attr = {
            x: coord.x,
            y: coord.y
        };
        
        if ( coord.vertical ) {
            Ext.apply(attr, {
                rotate: {
                    x:       coord.rotateX,
                    y:       coord.rotateY,
                    degrees: coord.degrees
                }
            });
        };
        
        // We don't need to redraw the Sprite yet
        sprite.setAttributes(attr, false);
        
        return sprite;
    },

    /**
     * @private
     * Calculate title sprite coordinates.
     */
    calcTitleCoordinates: function(sprite) {
        var me = this,
            surface = me.surface,
            width = surface.width,
            height = surface.height,
            chartBBox = me.chartBBox || { x: 0, y: 0 },
            uround = Ext.util.Format.round,
            titleBBox,
            offset, x = 0, y = 0, degrees;
        
        titleBBox  = sprite.getBBox();
        offset = uround( titleBBox.height / 2, 0 );

        switch ( me.titleLocation ) {
        case 'top':
            x = uround( (width - titleBBox.width) / 2, 0 );
            y = titleBBox.height - offset + me.titlePadding;
            break;
        case 'left':
            x = offset + me.titlePadding;
            // Leftmost title needs to be centered vertically -- and rotated, too
            y = uround( ((height - titleBBox.width) / 2) + titleBBox.width, 0 );
            degrees = 270;
            break;
        case 'right':
            x = width - offset - me.titlePadding;
            // Rightmost title needs to be centered vertically
            y = uround( (height - titleBBox.width) / 2, 0 );
            degrees = 90;
            break;
        case 'bottom':
            x = uround( (width - titleBBox.width) / 2, 0 );
            y = height - offset - me.titlePadding;
            break;
        default:
            x = 0;
            y = 0;
            sprite.hidden = true;   // XXX Shouldn't do this
        };

        return {
            x:        x,
            y:        y,
            width:    titleBBox.width,
            height:   titleBBox.height,
            vertical: me.titleLocation == 'left' || me.titleLocation == 'right',
            rotateX:  x,
            rotateY:  y,
            degrees:  degrees
        };
    },
    
    /**
     * Redraws all of the Chart components.
     */
    redraw: function() {
        var me = this;

        // Draw the title first so other elements can adjust their positions
        me.drawTitleSprite();
        
        me.callParent(arguments);
    }
});