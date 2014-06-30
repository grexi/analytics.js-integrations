
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('segmentio/analytics.js-integration-tester@1.3.0');
var plugin = require('./');

describe('HubSpot', function(){
  var HubSpot = plugin.Integration;
  var hubspot;
  var analytics;
  var options = {
    portalId: 62515
  };

  beforeEach(function(){
    analytics = new Analytics;
    hubspot = new HubSpot(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(hubspot);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    hubspot.reset();
  });
  
  it('should have the right settings', function(){
    var Test = integration('HubSpot')
      .assumesPageview()
      .readyOnLoad()
      .global('_hsq')
      .option('portalId', null);

    analytics.validate(HubSpot, Test);
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(hubspot, 'load');
    });

    afterEach(function(){
      hubspot.reset();
    });

    describe('#initialize', function(){
      it('should create window._hsq', function(){
        analytics.assert(!window._hsq);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._hsq instanceof Array);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(hubspot.load);
      });
    });

    describe('#loaded', function(){
      it('should test window._hsq.push', function(){
        window._hsq = [];
        analytics.assert(!hubspot.loaded());
        window._hsq.push = function(){};
        analytics.assert(hubspot.loaded());
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(hubspot, done);
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
        analytics.stub(window._hsq, 'push');
      });

      it('should not send traits without an email', function(){
        analytics.identify('id');
        analytics.didNotCall(window._hsq.push);
      });

      it('should send traits with an email', function(){
        analytics.identify(null, { email: 'name@example.com' });
        analytics.called(window._hsq.push, ['identify', { email: 'name@example.com' }]);
      });

      it('should send an id and traits with an email', function(){
        analytics.identify('id', { email: 'name@example.com' });
        analytics.called(window._hsq.push, ['identify', {
          id: 'id',
          email: 'name@example.com'
        }]);
      });

      it('should convert dates to milliseconds', function(){
        var date = new Date();
        analytics.identify(null, {
          email: 'name@example.com',
          date: date
        });
        analytics.called(window._hsq.push, ['identify', {
          email: 'name@example.com',
          date: date.getTime()
        }]);
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._hsq, 'push');
      });

      it('should send an event', function(){
        analytics.track('event');
        analytics.called(window._hsq.push, ['trackEvent', 'event', {}]);
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        analytics.called(window._hsq.push, ['trackEvent', 'event', { property: true }]);
      });

      it('should convert dates to milliseconds', function(){
        var date = new Date();
        var ms = date.getTime();

        analytics.track('event', { date: date });
        analytics.called(window._hsq.push, ['trackEvent', 'event', { date: ms }]);
      });
    });

    describe('#page', function(){
      beforeEach(function(){
        analytics.stub(window._hsq, 'push');
      });

      it('should send a page view', function(){
        analytics.page();
        analytics.called(window._hsq.push, ['_trackPageview']);
      });
    });
  });
});