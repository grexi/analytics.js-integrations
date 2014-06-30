
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('segmentio/analytics.js-integration-tester@1.3.0');
var plugin = require('./');

describe('Lucky Orange', function(){
  var Lucky = plugin.Integration;
  var lucky;
  var analytics;
  var options = {
    siteId: '17181'
  };

  beforeEach(function(){
    analytics = new Analytics;
    lucky = new Lucky(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(lucky);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    lucky.reset();
  });
  
  it('should have the right settings', function(){
    var Test = integration('Lucky Orange')
      .assumesPageview()
      .readyOnLoad()
      .global('_loq')
      .global('__wtw_lucky_site_id')
      .global('__wtw_lucky_is_segment_io')
      .global('__wtw_custom_user_data')
      .option('siteId', null);

    analytics.validate(Lucky, Test);
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(lucky, 'load');
    });

    afterEach(function(){
      lucky.reset();
    });

    describe('#initialize', function(){
      it('should create window._loq', function(){
        analytics.assert(!window._loq);
        analytics.initialize();
        analytics.page();
        analytics.assert(window._loq instanceof Array);
      });

      it('should initialize the lucky variables', function(){
        analytics.initialize();
        analytics.page();
        analytics.assert(window.__wtw_lucky_site_id === options.siteId);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(lucky.load);
      });
    });

    describe('#loaded', function(){
      it('should test window.__wtw_watcher_added', function(){
        analytics.assert(!lucky.loaded());
        window.__wtw_watcher_added = true;
        analytics.assert(lucky.loaded());
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(lucky, done);
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
        analytics.stub(window._loq, 'push');
      });

      it('should send name', function(){
        analytics.identify(null, { email: 'test@example.com' });
        analytics.deepEqual(window.__wtw_custom_user_data, { email: 'test@example.com' });
      });

      it('should send name', function(){
        analytics.identify(null, { name: 'test' });
        analytics.deepEqual(window.__wtw_custom_user_data, { name: 'test' });
      });

      it('should send traits', function(){
        analytics.identify('id', { name: 'test', email: 'test@example.com' });
        analytics.deepEqual(window.__wtw_custom_user_data, { id: 'id', name: 'test', email: 'test@example.com' });
      });
    });
  });
});