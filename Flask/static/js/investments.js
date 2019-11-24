const datapoints = [0, 20, 20, 60, 60, 120, NaN, 180, 120, 125, 105, 110, 170];
const config = {
    type: 'line',
    data: {
        labels: ['Mai 2018', 'Iun 2018', 'Iul 2018', 'Aug 2018', 'Sep 2018', 'Oct 2018', 'Nov 2018', 'Dec 2018', 'Ian 2019', 'Feb 2019'],
        datasets: [{
            label: 'Low-risk',
            data: [0, 1.1, 1.9, 2.5, 2.6, 5.6, 5.1, 8.1, 7.5, 6.7],
            borderColor: 'red',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            fill: false,
        }, {
            label: 'Medium-risk',
            data: [0, 4, 2, 3, 1, 5, 4, 6, 7, 8.5],
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            fill: false,
        }, {
            label: 'High-risk',
            data: [0, 10, 6, 1, 7, 8, 3, 2, 1, 4],
            borderColor: 'green',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            fill: false,
        }]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Evolution of Investment Funds'
        },
        tooltips: {
            mode: 'index'
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                },
                ticks: {
                    suggestedMin: -5,
                    suggestedMax: 20,
                }
            }]
        }
    }
};

window.onload = function() {
    const graphElem = document.getElementById('graph-risk');
    const ctx = graphElem.getContext('2d');
    const graphRisk = new Chart(ctx, config);
};
