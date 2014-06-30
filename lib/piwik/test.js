
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('segmentio/analytics.js-integration-tester@1.3.0');
var plugin = require('./');

describe('Piwik', function(){
  var Piwik = plugin.Integration;
  var piwik;
  var analytics;
  var options = {
    siteId: 42,
    url: 'https://demo.piwik.org'
  };

  beforeEach(function(){
    analytics = new Analytics;
    piwik = new Piwik(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(piwik);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
  });

  after(function(){
    piwik.reset();
  });

  it('should have the right settings', function(){
    var Test = integration('Piwik')
      .global('_paq')
      .option('siteId', '')
      .option('url', null)
      .readyOnLoad()
      .mapping('goals');

    analytics.validate(Piwik, Test);
  });
  
  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(piwik, 'load');
    });

    afterEach(function(){
      piwik.reset();
    });

    describe('#initialize', function(){
      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(piwik.load);
      });

      it('should push the id onto window._paq', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._paq[0], ['setSiteId', options.siteId]);
      });

      it('should push the url onto window._paq', function(){
        analytics.initialize();
        analytics.page();
        analytics.deepEqual(window._paq[1], ['setTrackerUrl', options.url + "/piwik.php"]);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(piwik, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });

    describe('#page', function(){
      it('should send a page view', function(){
        analytics.page();
      });
    });

    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window._paq, 'push');
      });

      it('should track goals', function(){
        piwik.options.goals = [{ key: 'goal', value: 1 }];
        analytics.track('goal');
        analytics.called(window._paq.push, ['trackGoal', 1, 0]);
      });

      it('should send .revenue()', function(){
        piwik.options.goals = [{ key: 'goal', value: 2 }];
        analytics.track('goal', { revenue: 10 });
        analytics.called(window._paq.push, ['trackGoal', 2, 10]);
      });

      it('should send .total()', function(){
        piwik.options.goals = [{ key: 'completed order', value: 10 }];
        analytics.track('Completed Order', { total: 20 });
        analytics.called(window._paq.push, ['trackGoal', 10, 20]);
      });
    });
  });
});