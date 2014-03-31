//select widget:
// - change slider scale values according to widget data
// - remember last value of previous widget
var selectWidget = function(e){
    e = e || window.event;
    e = e.target || e.srcElement;

    var widget_id = e.id.replace(/^\D+/,'');
    var slider = document.getElementById(slider_object_name);
    slider.min = widgets[widget_id].scale[0];
    slider.max = widgets[widget_id].scale[1];
    document.getElementById("min").innerHTML = slider.min;
    document.getElementById("max").innerHTML = slider.max;

    for(i in widgets){
        canvas = document.getElementById(canvas_object_name+widgets[i].type+i);
        if(widgets[i].selected){
            canvas.style.backgroundColor = "#ffffff";
            widgets[i].lastvalue = document.getElementById("output").innerHTML;
            widgets[i].selected = false;
            break;
        }
    }

    document.getElementById("output").innerHTML = widgets[widget_id].lastvalue;
    widgets[widget_id].selected = true;
    e.style.backgroundColor = "#cccccc";

    //remove previous listener:
    var new_slider = slider.cloneNode(true);
    slider.parentNode.replaceChild(new_slider, slider);

    new_slider.addEventListener("change", function(){sliderChange(widget_id,this.value)});
}

//slider scale listener function
function sliderChange(widget_id,value){
    if(document.getElementById(canvas_object_name+graph_types[0]+widget_id)){
        drawGraph(document.getElementById(canvas_object_name+graph_types[0]+widget_id),value);
    }
    if(document.getElementById(canvas_object_name+graph_types[1]+widget_id)){
        drawHistogram(document.getElementById(canvas_object_name+graph_types[1]+widget_id),value);
    }
    document.getElementById("output").innerHTML = value;
}

//load data depends on active tab
function loadPanel(id,tab){
    var old_tab = this.document.getElementById('selected');
    if(old_tab){
        old_tab.id = '';
    }
    tab.id = 'selected';
    this.document.getElementById('content').innerHTML = '';
    this.document.getElementById('panel').innerHTML = '<h1 id="panel_header">'+tabs[id].title+'</h1>';
    switch(tabs[id].type){
        case 'widgets':
            for(i in widgets)
                this.document.getElementById('panel').innerHTML += '<div draggable="true" ondragstart="drag(event)" id="'+widgets[i].type+i+'">'+widgets[i].title+'</div>';

            break;
        default:
            break;
    }

}


function drawGraph(canvas, value){
    var pi = 3.14;
    var ctx=canvas.getContext("2d");

    ctx.clearRect(0, 0, 300, 250);

    var prev_x = 0;
    var prev_y = 0;
    ctx.beginPath();
    for(x=-5; x<=5; x++){
        y = Math.ceil(((1/(value*Math.sqrt(2*pi)))*Math.exp(-(x*x/(2*value*value))))*10); //normal destribution formula,mu=0
        if(!prev_x && !prev_y){
            prev_x = x;
            prev_y = y;
        }

        ctx.fillStyle = "red";
        ctx.fillRect(x*20+100,80 - y*20,3,3);

        ctx.moveTo(prev_x*20+100,80 - prev_y*20);
        ctx.lineTo(x*20+100,80 -y*20);

        prev_x=x;
        prev_y=y;
    }

    ctx.stroke();
    ctx.closePath();
}

function drawHistogram(canvas, value){
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "yellow";
    ctx.fillRect(0,0,75,100);

    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0,0,75,100 - value);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";

    ctx.clearRect(80, 0, 40, 100);
    ctx.fillText(value,80,100 -value);
}


//drag and drop functions:
function allowDrop(ev)
{
    ev.preventDefault();
}

function drag(ev)
{
    ev.dataTransfer.setData("Text",ev.target.id);
}

function drop(ev)
{
    ev.preventDefault();
    var data = ev.dataTransfer.getData("Text");
    var obj = document.getElementById(data);
    if(data.match('record')){ //edit table - tab "table" is active
        switch(ev.target.getAttribute('id')){
            case 'content': //id we move an object from left panel to tab content
                ev.target.appendChild(obj);
                for(i in obj.children)      //set all data of the record as visible
                    obj.children[i].style.display = 'block';
                break;
            default:
                //insert record after the target
                var parent = ev.target.parentNode;
                var next = ev.target.nextSibling;
                if (next && next.id) {
                    parent.insertBefore(obj, next);
                    //set left margin for the record obj
                    var prev = obj.previousSibling;
                    var margin = prev.getAttribute('style').replace(/\D+/gi,'');
                    obj.style.marginLeft = parseInt(margin)+20 +'px';
                } else {
                    document.getElementById('panel').appendChild(obj);
                    obj.style.marginLeft = '0px';
                }

                //  hide all record data except the name
                for(i in obj.children)
                    if(i!=1)
                        if(obj.children[i].style)
                            obj.children[i].style.display = 'none';
                break;
        }
    }
    else{       //work with widgets - tab "widjets" is active
        switch(ev.target.getAttribute('id')){
            case 'panel':
                var canvas = document.getElementById(canvas_object_name+data);
                obj.removeChild(canvas);
                break;
            case 'content':
                if(!document.getElementById(canvas_object_name+data)){
                    var canvas = document.createElement('canvas');
                    canvas.id = canvas_object_name+data;
                    var widget_id = data.replace(/^\D+/,'');
                    widgets[widget_id].lastvalue = widgets[widget_id].defaultvalue;
                    switch(data.replace(/\d+$/,'')){
                        case graph_types[0]:
                            drawGraph(canvas,widgets[widget_id].defaultvalue);
                            break;
                        case graph_types[1]:
                            drawHistogram(canvas,widgets[widget_id].defaultvalue);
                            break;
                        default:
                            break;
                    }

                    canvas.onclick = selectWidget;

                    obj.appendChild(canvas);
                }
                else{
                    //obj.style.top = cursorY;
                    //obj.style.left = cursorX;
                    //obj.style.position = 'relative';
                    //return true;
                }
                break;
            default:
                return true;
                break;
        }

        ev.target.appendChild(obj);

        if(ev.target.id == 'content' ){ //show slider scale object
            if(!document.getElementById(slider_object_name)){
                document.getElementById('panel_bottom').innerHTML += '<div align="center" id="slider_panel">Выделенный виджет<hr><span id="min">'+widgets[widget_id].scale[0]+'</span> <input type="range" id="'+slider_object_name+'" min="'+widgets[widget_id].scale[0]+'" max="'+widgets[widget_id].scale[1]+'" > <span id="max">'+widgets[widget_id].scale[1]+'</span><br>Текущее значение: <span id="output">'+widgets[widget_id].defaultvalue+'</span></div>';
                obj.style.backgroundColor = "#cccccc";
                widgets[widget_id].selected = true;
                document.getElementById(slider_object_name).addEventListener("change", function(){
                    sliderChange(widget_id,this.value);
                });
            }
        }
        else{//hide slider scale when all widgets are on the left panel
            if(!document.getElementById('content').hasChildNodes())
                document.getElementById('panel_bottom').innerHTML = '';
        }
    }
}



