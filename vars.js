var graph_types = ['graph','hist']; //type of graphs;

var widgets = [ //available widgets
    {type: graph_types[0], scale: [-3,3],  title: 'Виджет график', lastvalue:0, selected:false, defaultvalue:1},
    {type: graph_types[1], scale: [0,100], title: 'Виджет гистограмма',lastvalue:0, selected: false, defaultvalue:40}
];

var tabs = [
    {title: 'Виджеты',type: 'widgets'},
];

var canvas_object_name = 'canvas';
var slider_object_name = 'slider';
