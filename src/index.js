const fs   = require('fs');
const Tone = require('tone');
const R    = require('ramda');
const k    = new Kibo();

const keyboard = 'qwertyuiop[]asdfghjklzxcvbnm'.split('');
// const notes = [
//   "A0", "C1", "D#1", "F#1", "A1", "C2", "D#2", "F#2", "A2", "C3", "D#3", 
//   "F#3", "A3", "C4", "D#4", "F#4", "A4", "C5", "D#5", "F#5", "A5", "C6", 
//   "D#6", "F#6", "A6", "C7", "D#7", "F#7", "A7", "C8"
// ];

// const AUDIODIR = './audio/new';
// var keymap = {};
// var samples = {};
// var lastKey = []

// fs.readdirSync(AUDIODIR)
//   .map( (file, index) => {
//     keyboard[index] && Object.assign(keymap, { [keyboard[index]]: notes[index] });
//     notes[index] && Object.assign(samples, { [notes[index]] : file })
//   });


// var piano = new Tone.Sampler(samples, { release: 1, baseUrl: './audio/new/' }).toMaster();

// var loop = new Tone.Loop(function(time){
// 	lastKey.map( (k, i) => {
//     piano.triggerAttackRelease(k, i + n, time)
//   })
// }, "4n")

// //play the loop between 0-2m on the transport
// loop.start(0)

// k.down('any', e => {
//   Tone.Transport.start('+0.1');
//   lastKey.push(keymap[e.key])
//   //piano.triggerAttack(keymap[e.key]);
// })
// .up('any', e => {
//   //Tone.Transport.stop()
//   //piano.triggerRelease(keymap[e.key]);
// });

var samples = {};
var keymap  = {};

const AUDIODIR = './audio/salamander';

fs.readdirSync(AUDIODIR)
  .filter( file => file.slice(file.indexOf('.'), file.length) != '.ogg')
  .map( (file, index) => {
    keyboard[index] && Object.assign(keymap, { [keyboard[index]]: file.slice(0, file.indexOf('.')) })
    Object.assign(samples, { [file.slice(0, file.indexOf('.'))]: `${AUDIODIR}/${file}` });
  });

const range = (from, to, value) => {
  var list = [];

  for (var i = from; i <= to; i++) {
      list.push(value);
  }

  return list;
}

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
var target = document.getElementById('steps');

R.map(arr => {
  arr.map( value => {
    var el = document.createElement('div');
        el.id = `${value.x}:${value.y}`;
        el.data = Object.keys(keymap)[arr.indexOf(value)];
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
        : (matrix[index[0]][index[1]] = 1, noteNames.push(keymap[e.target.data]))
    }
    target.appendChild(el);
  })
}, m)




var pos = 0;

var keys = new Tone.Players(samples, {
  "volume" : 20,
  "fadeOut" : "22n"
}).toMaster();

var noteNames = [];

document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
    var dot, eventDoc, doc, body, pageX, pageY;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
        eventDoc = (event.target && event.target.ownerDocument) || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
          (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    randomCoords = event.pageX / event.pageY;
    // Use event.pageX / event.pageY here
}

var loop = new Tone.Sequence(function(time, col) {
  (pos > matrix.length) ? (pos = 0) : (pos += 1)

  var column = matrix[col];

  for (var i = 0; i < matrix[col].length; i++){
    if (m[i] && m[i][col]) {
      var e = document.getElementById(R.values(m[col][i]).join(':'));
          e.style.color = column[i] === 1 ? 'red' : 'grey'
    }
    if (column[i] === 1) {
      if (m[i] && m[i][col]) {
        var e = document.getElementById(R.values(m[i][col]).join(':'));
        e.style.color = 'red'
      }
      //slightly randomized velocities
      var vel = Math.random() * 0.5 + (randomCoords ? randomCoords : 0.6 );
      var sample = noteNames[i] && keys.get(noteNames[i]);
      
      noteNames[i] && sample.start(time, 0, '22n', 0, vel);

    }
    if (column[i] === 0) {
      if (m[i] && m[i][col]) {
        var e = document.getElementById(R.values(m[i][col]).join(':'));
        e.style.color = 'white'
      }
    }
  }


}, R.range(0, matrix.length), "11n");

Tone.Transport.bpm.value = 100;
bpmValue = Tone.Transport.bpm.value;

var bpmInput = document.createElement('input');
    bpmInput.type ="range";
    bpmInput.id ="bmpRange";
    bpmInput.min = 60;
    bpmInput.max = 200;
    bpmInput.value = bpmValue;

    bpmInput.onchange = e => {
      Tone.Transport.bpm.value = e.target.value;
    }

document.body.appendChild(bpmInput);

loop.start();

k.down('any', e => {
    Tone.Transport.start('+0.1');
    noteNames.push(keymap[e.key]);

    matrix[pos] && noteNames.indexOf(noteNames[noteNames.length - 1]) != -1  
      && (matrix[pos][noteNames.indexOf(noteNames[noteNames.length - 1])] = 1)
  })
  .up('any', e => {
    // (pos > matrix.length) ? (pos = 0) : (pos += 1)

    if (matrix[pos] && noteNames.length > matrix[pos].length) {
      //matrix[pos] = [...[0,0,0,0,0,0,0,0,0,0,0]];
      
      noteNames[pos] = keymap[e.key]
      //matrix.push([0,0,0,0,0,0,0,0,0,0,0])
    }
    
  });