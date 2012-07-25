/*
    Basically the same Ext.chart.Chart but with some methods refactored for better flexibility.
    
    Since this class contains mostly Sencha code, I doubt I have any rights to release it.
    So let's say, I'm just providing it as an example under the same terms as Ext JS itself.
    Oh, whatever.

    This class is not intended to be used directly.
*/

Ext.define('Ext.ux.chart.Chart', {
    extend: 'Ext.chart.Chart',
    
    /**
     * @private Get initial insets; this method is intended to be overridden.
     */
    getInsets: function() {
        var me = this,
            insetPadding = me.insetPadding;

        return {
            top: insetPadding,
            right: insetPadding,
            bottom: insetPadding,
            left: insetPadding
        };
    },

    /**
     * @private Calculate insets.
     * This code is taken from Ext.chart.Chart.
     */
    calculateInsets: function() {
        var me = this,
            legend = me.legend,
            axes = me.axes,
            edges = ['top', 'right', 'bottom', 'left'],
            insets;

        function getAxis(edge) {
            var i = axes.findIndex('position', edge);
            return (i < 0) ? null : axes.getAt(i);
        }
        
        insets = me.getInsets();

        // Find the space needed by axes and legend as a positive inset from each edge
        for ( var i = 0, l = edges.length; i < l; i++ ) {
            var edge = edges[i];
            
            var isVertical = (edge === 'left' || edge === 'right'),
                axis = getAxis(edge),
                bbox;

            // Add legend size if it's on this edge
            if (legend !== false) {
                if (legend.position === edge) {
                    bbox = legend.getBBox();
                    insets[edge] += (isVertical ? bbox.width : bbox.height) + me.insetPadding;
                }
            }

            // Add axis size if there's one on this edge only if it has been
            //drawn before.
            if (axis && axis.bbox) {
                bbox = axis.bbox;
                insets[edge] += (isVertical ? bbox.width : bbox.height);
            }
        };
        
        return insets;
    },

    /**
     * @private Adjust the dimensions and positions of each axis and the chart body area after accounting
     * for the space taken up on each side by the axes and legend.
     * This code is taken from Ext.chart.Chart and refactored to provide better flexibility.
     */
    alignAxes: function() {
        var me = this,
            axesItems = me.axes.items,
            insets,
            chartBBox;
        
        insets = me.calculateInsets();

        // Build the chart bbox based on the collected inset values
        chartBBox = {
            x: insets.left,
            y: insets.top,
            width: me.curWidth - insets.left - insets.right,
            height: me.curHeight - insets.top - insets.bottom
        };
        me.chartBBox = chartBBox;

        // Go back through each axis and set its length and position based on the
        // corresponding edge of the chartBBox
        for ( var i = 0, l = axesItems.length; i < l; i++ ) {
            var axis = axesItems[i],
                pos = axis.position,
                isVertical = (pos === 'left' || pos === 'right');

            axis.x = (pos === 'right' ? chartBBox.x + chartBBox.width : chartBBox.x);
            axis.y = (pos === 'top' ? chartBBox.y : chartBBox.y + chartBBox.height);
            axis.width = (isVertical ? chartBBox.width : chartBBox.height);
            axis.length = (isVertical ? chartBBox.height : chartBBox.width);
        };
    }
});
