
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('segmentio/analytics.js-integration-tester@1.3.0');
var tick = require('next-tick');
var plugin = require('./');

describe('Lytics', function(){
  var Lytics = plugin.Integration;
  var lytics;
  var analytics;
  var options = {
    cid: 'x',
    cookie: 'lytics_cookie'
  };

  beforeEach(function(){
    analytics = new Analytics;
    lytics = new Lytics(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(lytics);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    lytics.reset();
  });

  it('should have the right settings', function(){
    var Test = integration('Lytics')
      .readyOnLoad()
      .global('jstag')
      .option('cid', '')
      .option('cookie', 'seerid')
      .option('delay', 2000)
      .option('sessionTimeout', 1800)
      .option('url', '//c.lytics.io');

    analytics.validate(Lytics, Test);
  });
  
  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(lytics, 'load');
    });

    afterEach(function(){
      lytics.reset();
    });

    describe('#initialize', function(){
      it('should create window.jstag', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window.jstag);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(lytics.load);
      });
    });

    describe('#loaded', function(){
      it('should test window.jstag.bind', function(){
        window.jstag = {};
        analytics.assert(!lytics.loaded());
        window.jstag.bind = function(){};
        analytics.assert(lytics.loaded());
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(lytics, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window.jstag, 'send');
      });

      it('should call send', function(){
        analytics.page(null, null, { property: true });
        analytics.called(window.jstag.send, {
          property: true,
          path: window.location.pathname,
          referrer: document.referrer,
          title: document.title,
          search: window.location.search,
          url: window.location.href
        });
      });
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window.jstag, 'send');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window.jstag.send, { _uid: 'id', id: 'id' });
      });

      it('should send traits', function(){
        analytics.identify(null, { trait: true });
        analytics.called(window.jstag.send, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window.jstag.send, { _uid: 'id', trait: true, id: 'id' });
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.jstag, 'send');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window.jstag.send, { _e: 'event' });
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window.jstag.send, { _e: 'event', property: true });
      });
    });
  });
});