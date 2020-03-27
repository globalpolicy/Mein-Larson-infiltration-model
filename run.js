//s0ft
function getRainfallIntensity(time) {
    if (time <= 1) {
        return 1.5;
    } else if (time > 1 && time <= 4) {
        return 0.1;
    } else if (time > 4 && time <= 6) {
        return 0.5;
    } else if (time > 6) {
        return 0;
    }
}

function run(targetT, delT, startF_p, startf, t_p) {
    const numIterations = (targetT - 0) / delT;
    var t = 0;
    var F = startF_p;
    var f = startf;
    var I_avg = 0,
        f = 0,
        delP = 0,
        S = 0,
        delS = 0,
        RO = 0,
        delF = 0,
        Q = 0;
    var output = {
        t: [],
        f: [],
        F: [],
        Q: [],
        S: []
    };
    for (var i = 1; i <= numIterations; i++) {
        if(t<t_p){
            output.t.push(t);
            output.f.push(getRainfallIntensity(t));
            output.F.push(getRainfallIntensity(t)*t);
            output.Q.push(0);
            output.S.push(0);
            t+=delT;
            continue;
        }

        I_avg = (getRainfallIntensity(t) + getRainfallIntensity(t+delT)) / 2;
        delF = f * delT;
        F += delF;
        delP = I_avg * delT;
        delS = delP - delF;
        S += delS;
        if (S > 0.5) {
            RO = S - 0.5;
            S = 0.5;
        } else {
            RO = 0;
        }
        if (S < 0) { //infiltration is greater than precipitation and so soil desaturation is taking place
            S = 0; //storage remains at zero
        }
        Q = RO / delT;
        f = K_s * (1 + (s*IMD) / F);

        output.t.push(t);
        output.f.push(f);
        output.F.push(F);
        output.Q.push(Q);
        output.S.push(S);
        t += delT;
        console.log("t=" + t + ";I_avg=" + I_avg + ";F=" + F + ";f=" + f + ";S=" + S + ";RO=" + RO + ";Q=" + Q);
    }
    return output;
}

function drawChart(output) {
    var ctx = document.getElementById('chart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: output.t,
            datasets: [{
                    label: 'Infiltration rate f (cm/hr)',
                    data: output.f,
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 1
                },
                {
                    label: 'Total infiltration F (cm)',
                    data: output.F,
                    borderColor: ['rgba(11,200,50,1)'],
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 1
                },
                {
                    label: 'Runoff (cm/hr)',
                    data: output.Q,
                    borderColor: ['rgba(11,50,230,1)'],
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 1
                },
                {
                    label: 'Storage (cm)',
                    data: output.S,
                    borderColor: ['rgba(111,50,30,1)'],
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 1
                }
            ]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 30
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (hr)'
                    }
                }]
            },
            maintainAspectRatio: false,
            responsive: true
        }
    });
}

function pruneOutput(output, skipNum) {
    var prunedOutput = {
        t: [],
        f: [],
        F: [],
        Q: [],
        S: []
    };
    for (var i = 0; i < output.t.length; i++) {
        if (i % (skipNum + 1) == 0) {
            prunedOutput.t.push(output.t[i].toFixed(2));
            prunedOutput.f.push(output.f[i]);
            prunedOutput.F.push(output.F[i]);
            prunedOutput.Q.push(output.Q[i]);
            prunedOutput.S.push(output.S[i]);
        }
    }
    return prunedOutput;
}

const s = 22.4,
    IMD = 0.25,
    K_s = 0.044;

let F_p = (s * IMD) / (getRainfallIntensity(0) / K_s - 1);
let t_p = F_p / getRainfallIntensity(0);

output = run(10, 0.01, F_p, getRainfallIntensity(t_p), t_p);
prunedOutput = pruneOutput(output, 8); //skip eight numbers between picks
drawChart(prunedOutput);