/*
 * Ext JS 4 extension that implements a Chart with a repositionable Title.
 *  
 * Version 0.99.
 *  
 * Copyright (C) 2011-2012 Alexander Tokarev.
 *
 * This code is licensed under the terms of the Open Source LGPL 3.0 license.
 * Commercial use is permitted to the extent that the code/component(s) do NOT
 * become part of another Open Source or Commercially licensed development library
 * or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
*/

Ext.define('Ext.ux.chart.TitleChart', {
    extend: 'Ext.ux.chart.Chart',
    alias:  'widget.titlechart',
    
    requires: [
        'Ext.draw.Sprite'
    ],
    
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
            offset    = Math.round( titleBBox.height / 4 );
            
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
     * @private Re-draws the title Sprite, if necessary.
     */
    redrawTitleSprite: function() {
        var me = this,
            sprite = me.titleSprite,
            attr;
            
        if ( me.title === false && sprite ) {
            me.titleSprite.hide(true);
            me.titleSprite.destroy();
            me.titleSprite = undefined;
            
            return;
        };
        
        if ( !sprite ) {
            return me.drawTitleSprite();
        };
        
        attr = me.getTitleAttributes(sprite);
        
        sprite.setAttributes(attr, true);
    },
    
    /**
     * @private
     * This method instantiates a text Sprite to display Chart title.
     */
    createTitleSprite: function() {
        var me = this,
            sprite;
        
        sprite = new Ext.draw.Sprite({
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
        
        var attr = me.getTitleAttributes(sprite);
        
        // We don't need to redraw the Sprite yet
        sprite.setAttributes(attr, false);
        
        return sprite;
    },

    /**
     * @private
     * Calculate title sprite coordinates.
     */
    getTitleAttributes: function(sprite) {
        var me = this,
            surface = me.surface,
            width = surface.width,
            height = surface.height,
            chartBBox = me.chartBBox || { x: 0, y: 0 },
            padding = me.titlePadding,
            uround = Ext.util.Format.round,
            titleBBox, titleX, titleY, titleHeight, titleWidth, offset,
            x = 0, y = 0, degrees = 0;
        
        titleBBox = sprite.getBBox();
        titleX    = titleBBox.x;
        titleY    = titleBBox.y;
        
        // Normalize dimensions
        if ( sprite.isVertical ) {
            titleHeight = titleBBox.width;
            titleWidth  = titleBBox.height;
        }
        else {
            titleHeight = titleBBox.height;
            titleWidth  = titleBBox.width;
        };
        
        offset = uround( titleHeight / 2, 0 );

        switch ( me.titleLocation ) {
        case 'top':
            x = uround( (width - titleWidth) / 2, 0 );
            y = titleHeight - offset + padding;
            break;
        case 'left':
            x = offset + padding;
            // Leftmost title needs to be centered vertically -- and rotated, too
            y = uround( ((height - titleWidth) / 2) + titleWidth, 0 );
            degrees = 270;
            break;
        case 'right':
            x = width - offset - padding;
            // Rightmost title needs to be centered vertically
            y = uround( (height - titleWidth) / 2, 0 );
            degrees = 90;
            break;
        case 'bottom':
            x = uround( (width - titleWidth) / 2, 0 );
            y = height - offset - padding;
            break;
        default:
            x = 0;
            y = 0;
            sprite.hidden = true;   // XXX Shouldn't do this
        };
        
        sprite.isVertical = me.titleLocation == 'left' || me.titleLocation == 'right';

        return {
            x:      x,
            y:      y,
            width:  titleWidth,
            height: titleHeight,
            rotate: {
                x:        x,
                y:        y,
                degrees: degrees
            }
        };
    },
    
    /**
     * Redraws all of the Chart components.
     */
    redraw: function() {
        var me = this;

        // Draw the title first so other elements can adjust their positions
        me.redrawTitleSprite();
        
        me.callParent(arguments);
    }
});