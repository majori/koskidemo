var ProgressBar = require('progressbar.js');

var progress = {
    bars: {},
    options: {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1000,
        color: '#FFEA82',
        trailColor: '#bee3ff',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        text: {
            style: {
                // Text color.
                // Default: same as stroke color (options.color)
                color: '#999',
                position: 'relative',
                left: '50%',
                top: '5px',
                padding: 0,
                margin: 0,
                transform: null
        },
        autoStyleContainer: false
        },
        from: {color: '#0051ff'},
        to: {color: '#ED6A5A'},
        step: (state, bar) => {
            bar.setText(Math.floor(bar.value() * progress.maxValue) + ' s');
            bar.path.setAttribute('stroke', state.color);
        }
    },
    maxValue: 0
};

progress.bars.first = new ProgressBar.Line('#first-rank-time', progress.options);
progress.bars.second = new ProgressBar.Line('#second-rank-time', progress.options);
progress.bars.third = new ProgressBar.Line('#third-rank-time', progress.options);
progress.bars.fourth = new ProgressBar.Line('#fourth-rank-time', progress.options);
progress.bars.fifth = new ProgressBar.Line('#fifth-rank-time', progress.options);


module.exports = progress;

