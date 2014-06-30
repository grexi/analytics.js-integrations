
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('segmentio/analytics.js-integration-tester@1.3.0');
var plugin = require('./');

describe('Qualaroo', function(){
  var Qualaroo = plugin.Integration;
  var qualaroo;
  var analytics;
  var options = {
    customerId: '47517',
    siteToken: '9Fd'
  };

  beforeEach(function(){
    analytics = new Analytics;
    qualaroo = new Qualaroo(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(qualaroo);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    qualaroo.reset();
  });
  
  it('should have the right settings', function(){
    var Test = integration('Qualaroo')
      .assumesPageview()
      .readyOnLoad()
      .global('_kiq')
      .option('customerId', '')
      .option('siteToken', '')
      .option('track', false);

    analytics.validate(Qualaroo, Test);
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(qualaroo, 'load');
    });

    afterEach(function(){
      qualaroo.reset();
    });

    describe('#initialize', function(){
      it('should create window._kiq', function(){
        analytics.assert(!window._kiq);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._kiq);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(qualaroo.load);
      });
    });

    describe('#loaded', function(){
      it('should test window._kiq.push', function(){
        window._kiq = [];
        analytics.assert(!qualaroo.loaded());
        window._kiq.push = function(){};
        analytics.assert(qualaroo.loaded());
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(qualaroo, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#identify', function(){
      beforeEach(function(){
        analytics.stub(window._kiq, 'push');
      });

      it('should send an id', function(){
        analytics.identify('id');
        analytics.called(window._kiq.push, ['identify', 'id']);
      });

      it('should send traits', function(){
        analytics.identify(null, { trait: true });
        analytics.called(window._kiq.push, ['set', { trait: true }]);
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        analytics.called(window._kiq.push, ['identify', 'id']);
        analytics.called(window._kiq.push, ['set', { trait: true, id: 'id' }]);
      });

      it('should prefer an email', function(){
        analytics.identify('id', { email: 'name@example.com' });
        analytics.called(window._kiq.push, ['identify', 'name@example.com']);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._kiq, 'push');
      });

      it('should not send anything by default', function(){
        analytics.track('event');
        analytics.didNotCall(window._kiq.push);
      });

      it('should set an event trait', function(){
        qualaroo.options.track = true;
        analytics.track('event');
        analytics.called(window._kiq.push, ['set', { 'Triggered: event': true }]);
      });
    });
  });
});