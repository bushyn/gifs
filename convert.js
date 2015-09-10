#!/usr/bin/env node
'use strict';
let fs = require('fs');
let path = require('path');
let child_process = require('child_process');
let gifDir = './gif';
let webmDir = mkdir('./webm');

function mkdir(dirname) {
  try {
    fs.mkdirSync(dirname);
  } catch(e) {
    if (e.code != 'EEXIST') throw e;
  }
  return dirname;
}

function order(fname) {
  return {name: fname,
          order: /^\d+\.(gif|webm)$/.test(fname)? parseInt(fname, 10):Infinity};
}

function cmp(a, b) {
  return a.order - b.order;
}

function rename(f, i) {
    let ext = path.extname(f.name),
        dir = ext.slice(1),
        fro = path.join(dir, f.name),
        to = path.join(dir, i + ext);
    if (fro !== to) fs.renameSync(fro, to);
    return to;
}

function webmExecSync(f) {
  let args = ['ffmpeg',
    '-i', f,
    '-y',
    '-c:v', 'libvpx',
    '-b:v', 0,
    '-crf', 12,
    '-cpu-used', 0,
    '-qmin', 0,
    '-qmax', 40,
    '-f', 'webm',
    path.join(webmDir, path.basename(f, path.extname(f)) + '.webm')];
  child_process.execSync(args.join(' '), {stdio: 'ignore'});
  console.log(`processed ${f}`);
}

fs.readdirSync(gifDir).map(order).sort(cmp).map(rename).forEach(webmExecSync);
// fs.readdirSync(webmDir).map(order).sort(cmp).map(rename);

function webmSpawn(f) {
  let command = 'ffmpeg';
  let args = ['-i', f,
              '-y',
              '-c:v', 'libvpx',
              '-b:v', 0,
              '-crf', 12,
              '-cpu-used', 0,
              '-qmin', 0,
              '-qmax', 40,
              '-f', 'webm',
              path.join(path.dirname(f), path.basename(f, '.gif')+'.webm')];
  let ffmpeg = child_process.spawn(command, args);
  ffmpeg.stdout.on('data', data => console.log(data.toString()));
  ffmpeg.stderr.on('data', data => console.log(data.toString()));
  ffmpeg.on('error', error => console.log(error.toString()));
  ffmpeg.on('close', code => { if(code) console.log(`child process exited with ${code}`) });
}

// webmSpawn('./test/tooth.gif');

