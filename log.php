<?php

// Don't do anything for now...
die();

/*
 * $pad=',' gives $pad a default value, meaning we don't have 
 * to pass printArray a value for it if we don't want to if we're
 * happy with the given default value (comma)
 *
 * source from: http://stackoverflow.com/questions/3489387/php-post-print-variable-name-along-with-value
 */
function arrayToString($array, $pad=',') {
	$return = "";
	foreach ($array as $key => $value) {
		$return .= $pad . $value;
		if (is_array($value)) {
			$return .= printArray($value, $pad);
		}
	}
	return $return;
}

$fileName = "test.log";
$file = fopen($fileName, 'a') or die("can't open file");
$data = substr(arrayToString($_POST), 1) . "\n";
fwrite($file, $data);
fclose($file);

?>