var view;
var ctx;
var polygons = {
    convex: {
        color: 'blue',
        vertices: [[10, 100], [10, 200],
        [300, 400], [300, 100]]
    },
    concave: {
        color: 'green', // choose color here!
        vertices: [[100,100],[200,50],[300,100],[300,300],
        [200,200],[100,300]]
    },
    self_intersect: {
        color: 'red', // choose color here!
        vertices: [[100,50],[400,400],[100,400],[400,50]]
    },
    interior_hole: {
        color: 'black', // choose color here!
        vertices: [[100,100], [500,300], [100,300],
        [300,100], [300,500]
        ]
    }
};

// Init(): triggered when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    SelectNewPolygon();
    
}

// DrawPolygon(polygon): erases current framebuffer, then draws new polygon
function DrawPolygon(polygon) {
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;

    // Create empty edge table (ET)
    var edge_table = [];
    var i;
    for (i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();


    // Step 1: populate ET with edges of polygon
    var i = 0;
    var y_max;
    var x_ymin;
    var y_min;
    var delta_x;
    var delta_y;
    var edge;
    var length = polygon['vertices'].length;

    
    while (i !== (length -1)) {
        if (polygon['vertices'][i][1] >= polygon['vertices'][i+1][1]){
            y_max = polygon['vertices'][i][1];
            y_min = polygon['vertices'][i+1][1];
            x_ymin = polygon['vertices'][i+1][0];
            delta_x = polygon['vertices'][i][0] - polygon['vertices'][i+1][0];
            delta_y = polygon['vertices'][i][1] - polygon['vertices'][i+1][1];
            //console.log('first ^Y: ' + delta_y + ' ^x' + delta_x);
            edge = new EdgeEntry(y_max, x_ymin, delta_x, delta_y);
            edge_table[y_min].InsertEdge(edge);
        }
        else {
            y_max = polygon['vertices'][i+1][1];
            y_min = polygon['vertices'][i][1];
            x_ymin = polygon['vertices'][i][0];
            delta_x = polygon['vertices'][i+1][0] - polygon['vertices'][i][0];
            delta_y = polygon['vertices'][i+1][1] - polygon['vertices'][i][1];
            //console.log('second ^Y: ' + delta_y + ' ^x' + delta_x);
            edge = new EdgeEntry(y_max, x_ymin, delta_x, delta_y);
            edge_table[y_min].InsertEdge(edge);
        }
        i = i + 1;
    }
    if (polygon['vertices'][length-1][1] >= polygon['vertices'][0][1]){
        y_max = polygon['vertices'][length-1][1];
        y_min = polygon['vertices'][0][1];
        x_ymin = polygon['vertices'][0][0];
        delta_x = polygon['vertices'][0][0] - polygon['vertices'][length-1][0];
        delta_y = polygon['vertices'][0][1] - polygon['vertices'][length-1][1];
        //console.log('third ^Y: ' + delta_y + ' ^x' + delta_x);
        edge = new EdgeEntry(y_max, x_ymin, delta_x, delta_y);
        edge_table[y_min].InsertEdge(edge);
    }
    else {
        y_max = polygon['vertices'][0][1];
        y_min = polygon['vertices'][length-1][1];
        x_ymin = polygon['vertices'][length-1][0];
        delta_x = polygon['vertices'][length-1][0] - polygon['vertices'][0][0];
        delta_y = polygon['vertices'][length-1][1] - polygon['vertices'][0][0];
        //console.log('fourth ^Y: ' + delta_y + ' ^x' + delta_x);
        edge = new EdgeEntry(y_max, x_ymin, delta_x, delta_y);
        edge_table[y_min].InsertEdge(edge);
    }
        
    // Step 2: set y to first scan line with an entry in ET
    var y=0;
    while (edge_table[y].first_entry === null){
        y = y+1;
    }

    // Step 3: Repeat until ET[y] is NULL and AL is NULL
    //   a) Move all entries at ET[y] into AL
    //   b) Sort AL to maintain ascending x-value order
    //   c) Remove entries from AL whose ymax equals y
    //   d) Draw horizontal line for each span (pairs of entries in the AL)
    //   e) Increment y by 1
    //   f) Update x-values for all remaining entries in the AL (increment by 1/m)    
    
    while(y !== 600 || active_list.first_entry !== null){
        
        
        //inserting entry in edge table into active list if isnt null
        var inEntry = edge_table[y].first_entry;
        while(inEntry !== null ){
            active_list.InsertEdge(inEntry);
            inEntry = inEntry.next_entry;
        }
        
        //if the active list is populated, it will sort and then remove
        if (active_list.first_entry != null){
            active_list.SortList();
            active_list.RemoveCompleteEdges(y);
        }
        
        //draw line after rounding x values
        var hold = active_list.first_entry;
        while(hold !== null && hold.next_entry !== null){
            var draw_x1 = Math.ceil(hold.x);
            var draw_x2 = Math.ceil(hold.next_entry.x)-1;
            if(draw_x1<=draw_x2){
                DrawLine(draw_x1,y,draw_x2,y);
            }
            hold = hold.next_entry.next_entry;
        }
        
        y = y+1;
        
        //loop through active list and add next minimum x
        var list = active_list.first_entry;
        while(list !== null ){

            list.x = list.x + list.inv_slope;
            list = list.next_entry;
            
        }
		
	}
    
}

// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
}

function DrawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}