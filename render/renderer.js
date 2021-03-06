// TODO: add marking 'onclick' on the item selected
// TODO: add total of files in current folder at the 'status' panel

const fs = require('fs');

const { shell } = require('electron');

const $  = (e) => document.querySelector(e),
      $$ = (e) => document.querySelectorAll(e);

Object.prototype.attr = function (e) {
  return this.getAttribute(e);
};

Number.prototype.to_filesize = function () {
  let sizes = {
    'B' : 1024,
    'KB': 1024 * 1024,
    'MB': 1024 * 1024 * 1024,
    'GB': 1024 * 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024 * 1024
  };

  for (var key in sizes)
    if (this < sizes[key])
      return `${Math.round((parseFloat(this) / (sizes[key] / 1024)))} ${key}`;
    else
      return '';
};

let fileSize = (filename) =>
    fs.statSync(filename).size;

let directories = ['/'],
    previous    = [];

let getModDate = (date) =>
    `${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

let getUpDir = (dir) => {
  let temp = dir.split('/').filter(Boolean);

  temp = temp.slice(-(temp.length), -1);

  if (temp != "")
    return `/${temp.join('/')}/`;
  else
    return '/';
};

function readFolder(path = '/', append = false) {
  let maxSize = 0,
      fileCount = 0;

  fs.readdir(path, (err, files) => {
    'use strict';

    if (err) throw err;

    if (!err && append) directories.push(path);

    let fileContainer = $('#files[active] #display');
    fileContainer.innerHTML = '';
    fileContainer.setAttribute('directory', path);

    for (let file of files) {
      fs.stat(path + file, (err, status) => {
        let fileID = `${path}${file}/`;

        if (err) throw err;

        if (status.isDirectory())
          fileContainer.innerHTML +=
          `<tr oncontextmenu="contextMenuEvnt(event, '${fileID}', 'folder');">
              <td id="${fileID}" ondblclick="readFolder(this.id, true)" onclick="selectFolder(this)">
                <div>
                  <i class="material-icons">folder</i>
                  <p>${file}</p>
                </div>
              </td>
              <td></td>
              <td></td>
            </tr>`;
        else {
          fileContainer.innerHTML +=
            `<tr oncontextmenu="contextMenuEvnt(event, '${fileID}', 'file');">
              <td id="${fileID}" ondblclick="openFile(this.id)">${file}</td>
              <td>${getModDate(status.mtime)}</td>
              <td>${fileSize(fileID).to_filesize()}</td>
            </tr>`;

          maxSize += fileSize(fileID);
          $('.max-size').innerHTML = `${maxSize.to_filesize()} total`;
        }
      });
      ++fileCount;
    }
    $('.file-count').innerHTML = `${fileCount} files`;
  });
}

let openFile = (path) =>
    shell.openItem('C:' + path);

// push to Selector stack
let selectFolder = (folder) => {
  $$('#display tr td div i').forEach(e => e.innerHTML = 'folder');

  folder.childNodes[1].childNodes[1].innerHTML = 'folder_open';
  folder.parentNode.classList.add('active');
};

let goForward = () =>
    readFolder(previous.pop(), true);

let goBack = () => {
  previous.push(directories.pop());

  if (previous.length > 0)
    $('.nav .control .forward').classList.remove('deactivated');
  else
    $('.nav .control .forward').classList.add('deactivated');

  readFolder(directories.pop(), true);
};
