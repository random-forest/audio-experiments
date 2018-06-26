const Tone = require('tone');
const R = require('ramda')
const k = new Kibo();
const $ = require('../libs/jquery.min.js');

var y = 0;
var currentSynthIndex = 0;
var loopEnabled = false;
var delayEnabled = false;

const keyboard = 'qwertyuiop[]asdfghjklzxcvbnm'.split('');
const notes = [
  "A0", "C1", "D#1", "F#1", "A1", "C2", "D#2", "F#2", "A2", "C3", "D#3", 
  "F#3", "A3", "C4", "D#4", "F#4", "A4", "C5", "D#5", "F#5", "A5", "C6", 
  "D#6", "F#6", "A6", "C7", "D#7", "F#7", "A7", "C8"
];

const range = (from, to, value) => {
  var list = [];

  for (var i = from; i <= to; i++) {
      list.push(value);
  }

  return list;
}

var keyMap = R.zipObj(keyboard, notes);

var runtime = [];

var delayTime = 1;

var pitchDecay = 0.05;
var envelopeAttack = 0.001;
var sustain = 0.001;
var decay = 1.4;
var release = 1.4;
var detune = 0;
var resonance = 0.4;

var membraneDefaults = {
  pitchDecay,
  octaves  : 11,
  oscillator  : {
    type  : "sine"
  },
  envelope  : {
    attack  : envelopeAttack,
    decay,
    sustain,
    release,
    attackCurve  : "exponential"
  }
};

var synthMembrane = new Tone.MembraneSynth(membraneDefaults).toMaster();
var monoDefaults = {
  frequency: 'C4',
  detune: detune,
  oscillator: {
    type: 'square'
  },
  filter: {
    Q: 6 ,
    type: 'lowpass',
    rolloff: -24
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.9,
    release: 1
  },
  filterEnvelope: {
    attack: 1.06,
    decay: 0.2,
    sustain: 0.5,
    release: 2,
    baseFrequency: 400,
    octaves: 7,
    exponent: 2
  }
}
var synthMono = new Tone.MonoSynth(monoDefaults).toMaster();
var fmDefaults = {
  harmonicity  : 3 ,
  modulationIndex  : 10 ,
  detune  : 0 ,
  oscillator  : {
    type  : "sine"
  }  ,
  envelope  : {
  attack  : 0.01 ,
  decay  : 3.01 ,
  sustain  : 1 ,
  release  : 0.5
  }  ,
  modulation  : {
    type  : "square"
  }  ,
  modulationEnvelope  : {
    attack  : 15.5 ,
    decay  : 0 ,
    sustain  : 1 ,
    release  : 0.5
  }
}
var synthFM = new Tone.FMSynth(fmDefaults).toMaster();
var pluckDefaults = {
  attackNoise  : 1 ,
  dampening  : 4000 ,
  resonance: resonance
};

var synthPluck = new Tone.PluckSynth(pluckDefaults).toMaster()

var colors = {
  MonoSynth: 'yellow',
  MembraneSynth: 'red',
  FMSynth: 'blue',
  PluckSynth: 'green'
}
var synths = [
  ['MonoSynth', synthMono], 
  ['MembraneSynth', synthMembrane],
  ['FMSynth', synthFM],
  ['PluckSynth', synthPluck]
];

var matrix = [
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0],
];

const build = matrix => {
  /*
  Height of Grid
  */

  let model = new Array(matrix.length);

  for( let i = 0; i < matrix.length; i++ ) {
    
    model[i] = new Array(matrix[i].length);
    for(let j = 0; j < matrix[i].length; j++) {
      model[i][j] = { x: i, y : j }
    }
  }

  return model;
};

var m = build(matrix);
var root = $('#content');

/**
 * List of available Synth
 * 
 */

const SynthList = function() {
  var el = $('<div>')
    .attr({ 
      size: R.length(synths) 
    })
    .change( e => (currentSynthIndex = +e.target.value));

  R.map( v => {
    el.append($('<span>')
      .text(R.indexOf(v, synths) + 1 + " - " +v[0])
      .css({ display: 'block',color: colors[v[0]], marginRight: '6px', cursor: 'pointer' })
    )
  }, synths);

  root.append(el)
};

SynthList()
// //create a loop
R.map(arr => {
  arr.map( value => {
    var el = document.createElement('div');
        el.id = `${value.x}:${value.y}`;
        el.data = keyMap[arr.indexOf(value)];
        el.textContent = '#';
        el.style.display = 'inline-block';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.top = `${value.x * 32}px`;
        el.style.bottom = `${value.y * 32}px`;
        el.style.color = "white";
        el.style.fontSize = "32px"
        el.style.cursor = "pointer";
    el.onclick = function(e) {
      var index = e.target.id.split(':');
      //e.target.textContent != '#' && noteNames.push(keymap[e.target.data]);
      Tone.Transport.start('+0.1');

      matrix[index[0]][index[1]] == 1
        ? (matrix[index[0]][index[1]] = 0)
        : (matrix[index[0]][index[1]] = 1, runtime.push(keyMap[e.target.data]))
    }
    $('#steps').append(el);
  })
}, m)

var loop = new Tone.Sequence(function(time, col){
  (y > matrix.length) ? (y = 0) : (y += 1)

  for (var i = 0; i < matrix[col].length; i++) {
    if (matrix[col][i] === 1) {
      if (m[i] && m[i][col]) {
        var e = document.getElementById(R.values(m[i][col]).join(':'));
        e.style.color = colors[synths[currentSynthIndex][0]]
      }

      runtime[i][1]();
      //synths[currentSynthIndex][1].triggerAttackRelease(runtime[y][1], time);
    } 
    else {
      if (m[col] && m[col][i]) {
        var e = document.getElementById(R.values(m[col][i]).join(':'));
            e.style.color = matrix[col][i] === 1 ? colors[synths[currentSynthIndex][0]] : 'grey'
      }
    }
    if (matrix[col][i] === 0) {
      if (m[i] && m[i][col]) {
        var e = document.getElementById(R.values(m[i][col]).join(':'));
        e.style.color = 'white'
      }
    }
  }

}, R.range(0, matrix.length), "12n");

Tone.Transport.bpm.value = 80;

function createRange(id, min, max, value, step, cb) {
  var el = document.createElement('input');
    el.type ="range";
    el.id = id;
    el.min = min;
    el.max = max;
    // el.style.display = 'inline-block';
    el.value = value;
    el.step = step;

    el.oninput = e => {
      cb(e)
    }

    $('#steps').append($('<div>').css({ display: 'block', color: 'white' }).text(`${id}`), el)
}

createRange('bmpRange', 60, 200, Tone.Transport.bpm.value, 1, e => {
  Tone.Transport.bpm.value = e.target.value;
});

createRange('envelopeAttack', 0.001, 25.000, envelopeAttack, 0.001, e => {
  envelopeAttack = e.target.value;
  synths[currentSynthIndex][1].envelope.attack = envelopeAttack;
});

createRange('pitchDecay', 0.001, 25.000, delayTime, 0.001, e => {
  delayTime = e.target.value;
  synths[currentSynthIndex][1].pitchDecay = delayTime;
});

createRange('sustain', 1.1, 10.1, sustain, 0.01, e => {
  synths[currentSynthIndex][1].envelope &&  (sustain = e.target.value)
  synths[currentSynthIndex][1].envelope && (synths[currentSynthIndex][1].envelope.sustain = sustain)
});


createRange('decay', 0.1, 10.1, decay, 0.1, e => {
  decay = e.target.value;
  
  synths[currentSynthIndex][1].envelope.decay = decay;
});

createRange('detune', 0, 100, detune, 5, e => {
  detune = e.target.value;
  
  synths[currentSynthIndex][1].detune = detune;
});

createRange('release', 0.4, 8.1, release, 0.1, e => {
  release = e.target.value;
  
  synths[currentSynthIndex][1].envelope.release = release;
});

createRange('resonance', 0.4, 18.1, resonance, 0.1, e => {
  resonance = e.target.value;
  
  synths[currentSynthIndex][1].resonance = resonance;
});

k.down('ctrl l', e => {
  loopEnabled = !loopEnabled;
})
.up('ctrl l', e => {
  loop.start();

  !loopEnabled && (runtime = [], matrix = [
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
  ])
})
.down('any number', e => (currentSynthIndex = e.key == '1' ? 0 : +e.key - 1))
.down('any letter', e => {
  var targetKey = keyMap[e.key];
  Tone.Transport.start('+0.1');
  targetKey && runtime.push([targetKey, synths[currentSynthIndex][1].triggerAttackRelease.bind(synths[currentSynthIndex][1],targetKey, '8n')]);
  
  !loopEnabled && synths[currentSynthIndex][1].triggerAttackRelease(targetKey, '8n');
  
  runtime.indexOf(runtime[runtime.length - 1]) !== -1 &&
    matrix[y] && (matrix[y][runtime.indexOf(runtime[runtime.length - 1])] = 1)
})
.up('any letter', e => {
  if (matrix[y] && runtime.length > matrix[y].length - 1) {
    runtime[y] = [keyMap[e.key], synths[currentSynthIndex][1].triggerAttackRelease.bind(synths[currentSynthIndex][1],keyMap[e.key]  , '8n')]
  }
});