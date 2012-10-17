<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Last.fm Stats - nicholast.fm</title>
  
  <meta http-equiv="Content-Type" content="text/html">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <link href="http://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css" rel="stylesheet">
  <link href="css/app.css" rel="stylesheet">
  <!--[if lt IE 9]>
    <link href="css/app-ie.css" rel="stylesheet">
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
  <![endif]-->
  
  <link rel="shortcut icon" href="favicon.ico">
  <link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144.png">
</head>
<body>
<div id="fb-root"></div>
<div class="container" id="main">
<div class="row">
  <div class="span10 offset1">
    <div id="logo-container">
      <a href="/"><img id="logo" src="img/nicholast.png" alt="nicholast.fm logo"></a>
    </div>
  </div>
</div>

<div class="row share-row">
  <div class="span1 offset7">
    <a href="https://twitter.com/share" class="twitter-share-button" data-url="http://nicholast.fm" data-via="nicholastdotfm" data-related="nicholastdotfm">Tweet</a>
  </div>
  <div class="span1">
    <g:plusone size="medium"></g:plusone>
  </div>
  <div class="span2">
     <div class="fb-like" data-href="http://nicholast.fm" data-send="true" data-layout="button_count" data-width="150" data-show-faces="true" data-font="lucida grande"></div>
  </div>
</div>

<div class="row">
  <div class="span4 offset1">
    <form id="userForm" class="form-inline">
      <div class="control-group">
        <div class="input-prepend input-append">
          <span class="add-on"><i class="icon-user"></i></span>
          <input id="user" maxlength="64" type="text" placeholder="last.fm username" title="Enter your last.fm username">
          <span id="clear-user" class="add-on"><a class="close">×</a></span>
        </div>
      </div>
    </form>
  </div>
  <!--[if lt IE 9]>
  <div class="span6">
    <div class="alert alert-error">
      <button type="button" class="close" data-dismiss="alert">×</button>
      <strong>Warning!</strong>
      This browser isn't fully supported, please update to a new browser.
    </div>
  </div>
  <![endif]-->
</div>

<div class="row">
  <div class="span10 offset1" id="main-tabbed">
    <div id="tabbable">
      <ul class="nav nav-tabs">
        <li id="getTracks" class="active"><a href="#MonthlyTopTracks" data-toggle="tab">Monthly Top Tracks</a></li>
        <li id="getArtistRecommendations"><a href="#ArtistRecommendations" data-toggle="tab">Artist Recommendations</a></li>
        <li id="getTrackRecommendations"><a href="#TrackRecommendations" data-toggle="tab">Track Recommendations</a></li>
        <li><a href="#About" data-toggle="tab">About</a></li>
      </ul>
      <div class="tab-content">
    
    <!-- start Monthly Top Tracks -->
    <div class="tab-pane active" id="MonthlyTopTracks">

    <form id="form" class="form-inline" onSubmit="return false;">
      <select id="month">
<?php
  // Dynamic Month Selector
  $month = date("m");
  for ($m = 0; $m < 12; $m++) {
    echo "<option value=\"$m\"";
    if ($month == $m + 1)
      echo " selected";
    echo ">" . date("F", mktime(0, 0, 0, $m + 1, 1, 2000)) . "</option>\n";
  }
?>
      </select>
      <select id="year">
<?php
  // Dynamic Year Selector
  $year = date("Y");
  for ($y = 2005; $y <= $year; $y++) {
    echo "<option value=\"$y\"";
    if ($year == $y)
      echo " selected";
    echo ">$y</option>\n";
  }
?>
      </select>
      <button class="btn btn-primary submit" data-loading-text="loading...">Submit</button>
    </form>
    <div id="trackInfo" class="hide">
      <div class="row">
        <div class="span10">
          <h3><span id="mttMonth"></span></h3>
        </div>
      </div>
      <div class="row">
        <div class="span10">
          <b>Total tracks:</b> <span id="totalTracks"></span>
        </div>
      </div>
      <div class="row">
        <div class="span10">
          <b>Total unique tracks:</b> <span id="totalUniqueTracks"></span>
        </div>
      </div>
      <div class="row">
        <div class="span10">
          <b>Song Repetition:</b> <span id="songRepetition"></span>
          <br><br>
        </div>
      </div>
      <div class="row">
        <div class="span10">
          <div class="accordion" id="accordion">
            <div class="accordion-group">
              <div class="accordion-heading">
                <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#BBCode">
                  <b>BB Code:</b>
                </a>
              </div>
              <div id="BBCode" class="accordion-body in">
                <div class="accordion-inner">
                  <textarea id="bbcode" rows="8" cols="70" readonly></textarea>
                </div>
              </div>
            </div>
            <div class="accordion-group">
              <div class="accordion-heading">
                <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion" href="#OldBBCode">
                  <b>Old BB Code:</b> (Based on kurtrips' heathaze.org BB Code)
                </a>
              </div>
              <div id="OldBBCode" class="accordion-body collapse">
                <div class="accordion-inner">
                  <textarea id="oldbbcode" rows="8" cols="70" readonly></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="span5">
          <b>Top Artists:</b><br>
          <span id="artistList"></span>
        </div>
        <div class="span5">
          <b>Top Tracks:</b><br>
          <span id="trackList"></span>
        </div>
      </div>
    </div>

    </div>
    <!-- end Monthly Top Tracks -->

    <!-- start Artist Recommendations -->
    <div class="tab-pane" id="ArtistRecommendations">

    <form class="form-inline" onSubmit="return false;">
      <select id="arPeriod">
        <option value="overall">Overall</option>
        <option value="7day">Last 7 Days</option>
        <option value="3month">Last 3 Months</option>
        <option value="6month">Last 6 Months</option>
        <option value="12month">Last 12 Months</option>
      </select>
      <select id="arLimit">
        <!-- For Testing -->
        <!--<option value="5">Top 5</option>-->
        <!-- For Testing -->
        <option value="50">Top 50</option>
        <option value="100">Top 100</option>
        <option value="200">Top 200</option>
      </select>
      <button class="btn btn-primary submit" data-loading-text="loading..." type="submit">Submit</button>
    </form>
    <div id="arDisplay" class="row hide">
      <span id="arList" class="span10"></span>
    </div>

    </div>
    <!-- end Artist Recommendations -->
    
    <!-- start Track Recommendations -->
    <div class="tab-pane" id="TrackRecommendations">

    <form class="form-inline" onSubmit="return false;">
      <select id="trPeriod">
        <option value="overall">Overall</option>
        <option value="7day">Last 7 Days</option>
        <option value="3month">Last 3 Months</option>
        <option value="6month">Last 6 Months</option>
        <option value="12month">Last 12 Months</option>
      </select>
      <select id="trLimit">
        <!-- For Testing -->
        <!--<option value="5">Top 5</option>-->
        <!-- For Testing -->
        <option value="50">Top 50</option>
        <option value="100">Top 100</option>
        <option value="200">Top 200</option>
      </select>
      <button class="btn btn-primary submit" data-loading-text="loading..." type="submit">Submit</button>
    </form>
    <div id="trDisplay" class="row hide">
      <span id="trList" class="span10"></span>
    </div>

    </div>
    <!-- end Track Recommendations -->

    <!-- start About -->
    <!-- Just playing around with this, as it is now, don't really like how it looks :-/ -->
    <div class="tab-pane" id="About">
    
    <div class="row">
      <div class="span10">
        <h1>nicholast.fm is brought to you by:</h1>
        <hr>
      </div>
    </div>

    <div class="row">
      <div class="span5">
        <div class="hero-unit">
          <h2>Nicholas Ness</h2>
          <p>"Fine."</p>
          <p>
            <a class="btn btn-primary btn-large" href="http://www.last.fm/user/nick1n" target="_blank">
             <i class="icon-white icon-music"></i> Check out Ness on Last.fm 
            </a>
          </p>
        </div>
      </div>
      <div class="span5">
        <div class="hero-unit">
          <h2>Nicholas Kramer</h2>
          <p>"Let's do dis!"</p>
          <p>
            <a class="btn btn-primary btn-large" href="http://twitter.namklabs.com" target="_blank">
             <i class="icon-white icon-comment"></i> Check out Kramer on Twitter 
            </a>
          </p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="span10">
        <p>Many thanks to last.fm, bootstrap, nickf, flagcounter, jQuery, and Felix Bruns' javascript last.fm api lib</p>
      </div>
    </div>
    <div class="row">
      <div class="span10">
        <p>Found a bug? Report it on our <a href="https://github.com/namklabs/nicholast.fm/issues?labels=Issue&state=open" class="link">github.com issue queue</a></p>
      </div>
    </div>
    <div class="row">
      <div class="span10">
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post">
          <input type="hidden" name="cmd" value="_s-xclick">
          <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" name="submit" alt="PayPal - The safer, easier way to pay online!">
          <img alt="" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
        </form>
      </div>
    </div>
    
    </div>
    <!-- end About -->
    
      </div><!-- end .tab-content -->
    </div><!-- end #tabbable -->
    <div id="progressBack" class="progress progress-info progress-striped active hide">
      <div id="progressBar" class="bar" style="width: 0%;"></div>
    </div>
  </div><!-- end #main-tabbed.span8 -->
  <div id="flags">
    <a href="http://s08.flagcounter.com/more/HQj4"><img src="http://s08.flagcounter.com/count/HQj4/bg=FFFFFF/txt=000000/border=CCCCCC/columns=3/maxflags=248/viewers=3/labels=1/pageviews=0/" alt="free counters"></a>
  </div>
</div><!-- end .row -->

<footer>
  <div class="row">
    <div class="span10 offset1">
      <br>
      <div id="ad-desktop" class="visible-desktop" align="center">
        <script type="text/javascript"><!--
          google_ad_client = "ca-pub-5694205610454375";
          /* FirstTest */
          google_ad_slot = "7850174638";
          google_ad_width = 728;
          google_ad_height = 90;
          //-->
        </script>
        <script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
      </div>
      <div id="ad-tablet" class="visible-tablet" align="center">
        <script type="text/javascript"><!--
          google_ad_client = "ca-pub-5694205610454375";
          /* TabletAd */
          google_ad_slot = "1063149193";
          google_ad_width = 468;
          google_ad_height = 60;
          //-->
        </script>
        <script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
      </div>
      <div id="ad-phone" class="visible-phone" align="center">
        <script type="text/javascript"><!--
          google_ad_client = "ca-pub-5694205610454375";
          /* MobileAd */
          google_ad_slot = "1215451455";
          google_ad_width = 320;
          google_ad_height = 50;
          //-->
        </script>
        <script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
      </div>
    </div>
  </div>
  <div class="row">
    <div id="footer" class="span12"></div>
  </div>
  <div class="row">
    <div class="span7 offset1">
      <p>nicholast.fm is by <a href="http://www.last.fm/user/nick1n" target="_blank" class="link">Nick</a> &amp; <a href="http://twitter.namklabs.com" target="_blank" class="link">Nick</a></p>
      <p>Copyright &copy; 2012</p>
    </div>
    <div class="span3">
      <p>Many thanks to last.fm, bootstrap, nickf, flagcounter, jQuery, and Felix Bruns' javascript last.fm api lib</p><br>
    </div>
  </div>
</footer>

</div><!-- end #main.container -->

<!-- scripts at the bottom of the body for faster loading -->
<!-- jQuery 1.8.1 -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/jquery.js"><\/script>')</script>

<!-- Bootstrap 2.1.1 Javascript Plugins: Transition, Tab, Tooltip, Button, Collapse -->
<script src="js/bootstrap.min.js"></script>

<!-- Last.fm API Javascript Library -->
<script src="js/lastfm.api.md5.js"></script>
<script src="js/lastfm.api.js"></script>

<!-- Custom Javascript -->
<script src="js/app.js"></script>

<!-- Widgets -->
<script type="text/javascript">
  // Google Analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-30386018-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
  })();
  
  // Twitter Tweet
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.async = true;
    js.src = "http://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'twitter-wjs'));
  
  // Facebook Like/Send
  // outputs a lot of errors to console :-/
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.async = true;
    js.src = "http://connect.facebook.net/en_US/all.js#xfbml=1";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
  
  // Google+
  (function() {
    var po = document.createElement('script');
    po.type = 'text/javascript';
    po.async = true;
    po.src = 'https://apis.google.com/js/plusone.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(po, s);
  })();

</script>
</body>
</html>
