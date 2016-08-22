'use strict';

/* global JSZhuyinServerIframeLoader, JSZhuyinServerWorkerLoader,
          JSZhuyinClient, DataLoader */

module('JSZhuyinServerIframeLoader');

test('load()', function() {
  var loader =
    new JSZhuyinServerIframeLoader('/base/test/resources/frame.html');
  expect(2);
  loader.onload = function() {
    ok(true, 'Passed!');
    loader.sendMessage({ 'hello': 'world!' });
  };
  loader.onmessage = function(msg) {
    deepEqual(msg, { 'hello': 'world!' }, 'Passed!');
    loader.unload();
    start();
  };
  stop();
  loader.load();
});

module('JSZhuyinServerWorkerLoader');

test('load()', function() {
  var loader =
    new JSZhuyinServerWorkerLoader('/base/test/resources/post_messenger.js');
  expect(2);
  loader.onload = function() {
    ok(true, 'Passed!');
    loader.sendMessage({ 'hello': 'world!' });
  };
  loader.onmessage = function(msg) {
    deepEqual(msg, { 'hello': 'world!' }, 'Passed!');
    loader.unload();
    start();
  };
  stop();
  loader.load();
});

module('JSZhuyinClient (iframe; preload data)');

test('load()', function() {
  var ime = new JSZhuyinClient();
  expect(2);
  ime.onload = function() {
    ok(ime.loaded, 'Passed!');
  };
  ime.onloadend = function() {
    ok(ime.loaded, 'Passed!');
    ime.unload();

    start();
  };

  stop();

  var loader = new DataLoader();
  loader.DATA_URL = '/base/test/resources/testdata.data';
  loader.onload = function() {
    var serverLoader = new JSZhuyinServerIframeLoader('/base/lib/frame.html');
    ime.load(serverLoader, {}, loader.data);
  };
  loader.load();
});

module('JSZhuyinClient (iframe)');

test('load()', function() {
  var ime = new JSZhuyinClient();
  expect(2);
  ime.onload = function() {
    ok(ime.loaded, 'Passed!');
  };
  ime.onloadend = function() {
    ok(ime.loaded, 'Passed!');
    ime.unload();

    start();
  };

  stop();
  ime.load(new JSZhuyinServerIframeLoader('/base/lib/frame.html'), {
    dataURL: '/base/test/resources/testdata.data'
  });
});

module('JSZhuyinClient (worker; preload data)');

test('load()', function() {
  var ime = new JSZhuyinClient();
  expect(2);
  ime.onload = function() {
    ok(ime.loaded, 'Passed!');
  };
  ime.onloadend = function() {
    ok(ime.loaded, 'Passed!');
    ime.unload();

    start();
  };

  stop();

  var loader = new DataLoader();
  loader.DATA_URL = '/base/test/resources/testdata.data';
  loader.onload = function() {
    var serverLoader = new JSZhuyinServerWorkerLoader('/base/lib/worker.js');
    ime.load(serverLoader, {}, loader.data);
  };
  loader.load();
});

module('JSZhuyinClient (worker)');

test('load()', function() {
  var ime = new JSZhuyinClient();
  expect(2);
  ime.onload = function() {
    ok(ime.loaded, 'Passed!');
  };
  ime.onloadend = function() {
    ok(ime.loaded, 'Passed!');
    ime.unload();

    start();
  };

  stop();
  ime.load(new JSZhuyinServerWorkerLoader('/base/lib/worker.js'), {
    dataURL: '/base/test/resources/testdata.data'
  });
});

test('load() non-exist files', function() {
  var ime = new JSZhuyinClient();
  expect(2);
  ime.onchunkload =
  ime.onpartlyloaded =
  ime.onpopulated =
  ime.onload = function() {
    ok(false, 'Passed!');
  };
  ime.onerror = function() {
    ok(true, 'Passed!');
  };
  ime.onloadend = function() {
    ok(ime.loaded, 'Passed!');
    ime.unload();

    start();
  };

  stop();
  ime.load(new JSZhuyinServerWorkerLoader('/base/lib/worker.js'), {
    dataURL: '/base/test/resources/404.data'
  });
});
