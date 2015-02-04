<?php

  // Read Project Metadata
  $pkg = json_decode(file_get_contents("package.json"));

  // minified css and js
  $DIST = '.' . $pkg->version . '.min';

  // non-minified css and js
  // $DIST = '';

?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Last.fm Stats - nicholast.fm</title>

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link href="dist/css/app<?= $DIST ?>.css" rel="stylesheet">
  <!--[if lt IE 9]>
    <link href="css/app-ie.css" rel="stylesheet">
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
  <![endif]-->

  <link rel="shortcut icon" href="favicon.ico">
  <link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144.png">
</head>
<body>
<div class="container">
<div class="row">
  <div class="span10 offset1">
    <div id="logo-container">
      <a><img id="logo" src="img/nicholast.png" alt="nicholast.fm logo"></a>
    </div>
  </div>
</div>

<div class="row share-row">
  <div class="span4 offset7">
    <a href="http://www.last.fm/group/nicholast.fm" class="btn-lastfm" target="_blank"><i class="icon-lastfm"></i> Join</a>
    <a href="http://www.facebook.com/nicholast.fm" class="btn-facebook" target="_blank"><i class="icon-facebook"></i> Like</a>
    <a href="http://twitter.com/nicholastdotfm" class="btn-twitter" target="_blank"><i class="icon-twitter"></i> Follow</a>
  </div>
</div>

<div class="row">
  <div class="span4 offset1">
    <form id="userForm" class="form-inline">
      <div class="control-group">
        <div class="input-prepend input-append">
          <span class="add-on"><i class="icon-user"></i></span>
          <input id="user" maxlength="64" type="text" placeholder="last.fm username" title="Enter your last.fm username" autofocus>
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
      This browser isn't fully supported, please update to a newer browser.
    </div>
  </div>
  <![endif]-->
</div>

<div class="row">
  <div class="span10 offset1" id="main-tabbed">
    <div id="tabbable">
      <ul class="nav nav-tabs">
        <li class="active"><a href="#MonthlyTopTracks" data-toggle="tab">Monthly Top</a></li>
        <li><a href="#YearlyTopTracks" data-toggle="tab">Yearly Top</a></li>
        <li><a href="#ArtistRecommendations" data-toggle="tab">Artist Recommendations</a></li>
        <li><a href="#TrackRecommendations" data-toggle="tab">Track Recommendations</a></li>
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
      <button class="btn btn-primary submit disabled" data-loading-text="loading...">Submit</button>
    </form>

    <div id="trackInfo" class="hide">
      <div class="row">
        <div class="span10">
          <h3><span id="mttMonth"></span></h3>
          <b>Total tracks:</b> <span id="totalTracks"></span><br>
          <b>Total unique tracks:</b> <span id="totalUniqueTracks"></span><br>
          <b>Song Repetition:</b> <span id="songRepetition"></span><br>
          <br>
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
                  <pre><code id="bbcode"></code></pre>
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
                  <pre><code id="oldbbcode"></code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="span10">
          <p><a href="#toptracks"><b>Top 10 Tracks:</b> (more)</a></p>
          <div id="trackList"></div>
        </div>
      </div>
      <br>

      <div class="row">
        <div class="span5">
          <p><a href="#topartists"><b>Top 10 Artists:</b> (more)</a></p>
          <div id="artistList"></div>
        </div>
        <div class="span5">
          <p><a href="#topalbums"><b>Top 10 Albums:</b> (more)</a></p>
          <div id="albumList"></div>
        </div>
      </div>

      <div class="row">
        <div id="toptracks" class="span10"><hr></div>
      </div>
      <div class="row">
        <div id="track-datagrid" class="span10"></div>
      </div>
      <div class="row">
        <div id="topartists" class="span10"><hr></div>
      </div>
      <div class="row">
        <div id="artist-datagrid" class="span10"></div>
      </div>
      <div class="row">
        <div id="topalbums" class="span10"><hr></div>
      </div>
      <div class="row">
        <div id="album-datagrid" class="span10"></div>
      </div>
    </div>

    </div>
    <!-- end Monthly Top Tracks -->

    <!-- start Yearly Top Tracks -->
    <div class="tab-pane" id="YearlyTopTracks">

    <form id="form" class="form-inline" onSubmit="return false;">
      <select id="year">
<?php

  // Dynamic Year Selector
  $selectedYear = date("Y", strtotime('-1 month'));
  $year = date("Y");
  for ($y = 2005; $y <= $year; $y++) {
    echo "<option value=\"$y\"";
    if ($selectedYear == $y)
      echo " selected";
    echo ">$y</option>\n";
  }

?>
      </select>
      <button class="btn btn-primary submit disabled" data-loading-text="loading...">Submit</button>
    </form>

    <div id="trackInfo" class="hide">
      <div class="row">
        <div class="span10">
          <h3><span id="mttMonth"></span></h3>
          <b>Total tracks:</b> <span id="totalTracks"></span><br>
          <b>Total unique tracks:</b> <span id="totalUniqueTracks"></span><br>
          <b>Song Repetition:</b> <span id="songRepetition"></span><br>
          <br>
        </div>
      </div>

      <div class="row">
        <div class="span10">
          <p><a href="#toptracks"><b>Top 10 Tracks:</b> (more)</a></p>
          <div id="trackList"></div>
        </div>
      </div>
      <br>

      <div class="row">
        <div class="span5">
          <p><a href="#topartists"><b>Top 10 Artists:</b> (more)</a></p>
          <div id="artistList"></div>
        </div>
        <div class="span5">
          <p><a href="#topalbums"><b>Top 10 Albums:</b> (more)</a></p>
          <div id="albumList"></div>
        </div>
      </div>

      <div class="row">
        <div id="toptracks" class="span10"><hr></div>
      </div>
      <div class="row">
        <div id="track-datagrid" class="span10"></div>
      </div>
      <div class="row">
        <div id="topartists" class="span10"><hr></div>
      </div>
      <div class="row">
        <div id="artist-datagrid" class="span10"></div>
      </div>
      <div class="row">
        <div id="topalbums" class="span10"><hr></div>
      </div>
      <div class="row">
        <div id="album-datagrid" class="span10"></div>
      </div>
    </div>

    </div>
    <!-- end Yearly Top Tracks -->

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
      <button class="btn btn-primary submit disabled" data-loading-text="loading..." type="submit">Submit</button>
    </form>
    <div id="arDisplay" class="row hide">
      <span id="ar-datagrid" class="span10"></span>
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
      <button class="btn btn-primary submit disabled" data-loading-text="loading..." type="submit">Submit</button>
    </form>
    <div id="trDisplay" class="row hide">
      <div id="tr-datagrid" class="span10"></div>
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
             <i class="icon-music icon-white"></i> Check out Ness on Last.fm
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
             <i class="icon-comment icon-white"></i> Check out Kramer on Twitter
            </a>
          </p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="span10">
        <p>Many thanks to last.fm, bootstrap, icomoon, Mark Dotto, nickf, flagcounter, jQuery, Fuel UX's Datagrid, grunt.js, Google, and <span class="web-font">Ubuntu</span></p>
      </div>
    </div>
    <div class="row">
      <div class="span10">
        <p>Found a bug? Report it on our <a href="https://github.com/nick1n/nicholast.fm/labels/Issue" target="_blank" class="link">github.com issue queue</a></p>
      </div>
    </div>
    <div class="row">
      <div class="span10">
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post">
          <input type="hidden" name="cmd" value="_s-xclick">
          <input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----">
          <input type="image" data-src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" name="submit" alt="PayPal - The safer, easier way to pay online!">
          <img data-src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
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

  <img class="hide" data-src="http://s08.flagcounter.com/mini/HQj4/bg_FFFFFF/txt_000000/border_CCCCCC/flags_0/">

</div><!-- end .row -->

<footer>
  <div class="row">
    <div class="span10 offset1">
      <br>
      <!-- ResponsiveAd -->
      <div class="ad-overflow">
        <ins class="adsbygoogle responsivead" data-ad-client="ca-pub-5694205610454375" data-ad-slot="6618888490"></ins>
      </div>
    </div>
  </div>
  <div class="row">
    <div id="footer" class="span12"></div>
  </div>
  <div class="row">
    <div class="span7 offset1">
      <p>nicholast.fm v<?= $pkg->version ?></p>
      <p>by <a href="http://www.last.fm/user/nick1n" target="_blank" class="link">Nick</a> &amp; <a href="http://twitter.namklabs.com" target="_blank" class="link">Nick</a></p>
      <p>Copyright &copy; 2015</p>
    </div>
    <div class="span3">
      <p>Many thanks to last.fm, bootstrap, icomoon, Mark Dotto, nickf, flagcounter, jQuery, Fuel UX's Datagrid, grunt.js, Google, and <span class="web-font">Ubuntu</span></p><br>
    </div>
  </div>
</footer>

</div><!-- end #main.container -->

<!-- Custom Templates -->
<script id="template-datagrid" type="text/template">
  <table class="table table-striped table-condensed table-hover datagrid">
    <thead>
      <tr>
        <th>
          <div id="caption" class="pull-left"></div>
          <div class="grid-controls pull-right">
            <div class="input-append search">
              <input type="text" class="input-medium" placeholder="Search">
              <button class="btn"><i class="icon-search"></i></button>
            </div>
          </div>
        </th>
      </tr>
    </thead>

    <tfoot>
      <tr>
        <th>
          <div class="grid-controls pull-left">
            <span><span class="grid-start"></span> - <span class="grid-end"></span> of <span class="grid-count"></span></span>
            <select class="grid-pagesize">
              <option>10</option>
              <option selected>20</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>Per Page</span>
          </div>
          <div class="grid-controls grid-pager pull-right">
            <button class="btn grid-prevpage"><i class="icon-arrow-left"></i></button>
            <span>Page</span>
            <input type="number">
            <span>of <span class="grid-pages"></span></span>
            <button class="btn grid-nextpage"><i class="icon-arrow-right"></i></button>
          </div>
        </th>
      </tr>
    </tfoot>
  </table>
</script>

<!-- scripts at the bottom of the body for faster loading -->
<script async src="dist/js/app<?= $DIST ?>.js" defer></script>

</body>
</html>
