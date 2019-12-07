var pieChartValues = [{
    y: 39.16,
    exploded: true,
    indexLabel: "Hello",
    color: "#1f77b4"
}, {
    y: 21.8,
    indexLabel: "Hi",
    color: "#ff7f0e"
}, {
    y: 21.45,
    indexLabel: "pk",
    color: " #ffbb78"
}, {
    y: 5.56,
    indexLabel: "one",
    color: "#d62728"
}, {
    y: 5.38,
    indexLabel: "two",
    color: "#98df8a"
}, {
    y: 3.73,
    indexLabel: "three",
    color: "#bcbd22"
}, {
    y: 2.92,
    indexLabel: "four",
    color: "#f7b6d2"
}];

renderPieChart(pieChartValues);

function renderPieChart(values) {

    var chart = new CanvasJS.Chart("pieChart", {
        backgroundColor: "white",
        colorSet: "colorSet2",

        title: {
            text: "Pie Chart",
            fontFamily: "Verdana",
            fontSize: 25,
            fontWeight: "normal",
        },
        animationEnabled: true,
        data: [{
            indexLabelFontSize: 15,
            indexLabelFontFamily: "Monospace",
            indexLabelFontColor: "darkgrey",
            indexLabelLineColor: "darkgrey",
            indexLabelPlacement: "outside",
            type: "pie",
            showInLegend: false,
            toolTipContent: "<strong>#percent%</strong>",
            dataPoints: values
        }]
    });
    chart.render();
}