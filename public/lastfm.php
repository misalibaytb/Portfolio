<?php
    const API_KEY = "2d5880076e3ef05167f3ab67c397854b";
    const SHARED_SECRET = "99e48b2fbb3a8b6fba6326332edf493e";
    const CACHE_FILE = __DIR__ . '/lastfm_cache.json';
    const CACHE_DURATION = 30; // seconds

    // Check if cache exists and is valid
    if (file_exists(CACHE_FILE) && (time() - filemtime(CACHE_FILE)) < CACHE_DURATION) {
        $cachedData = json_decode(file_get_contents(CACHE_FILE), true);
        $cachedData['cache_status'] = 'hit';
        $cachedData['cache_expires'] = filemtime(CACHE_FILE) + CACHE_DURATION;
        header('Content-Type: application/json');
        echo json_encode($cachedData);
        exit;
    }

    $url = "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=misaliba&api_key=" . API_KEY . "&format=json&limit=1";

    $response = file_get_contents($url);

    if ($response === FALSE) {
        die(json_encode(["error" => "Error occurred while making the GET request."]));
    }

    $data = json_decode($response, true);

    if ($data === NULL) {
        die(json_encode(["error" => "Error decoding JSON response."]));
    }

    // Save response to cache
    $data['cache_status'] = 'miss';
    $data['cache_expires'] = time() + CACHE_DURATION;
    file_put_contents(CACHE_FILE, json_encode($data));

    header('Content-Type: application/json');
    echo json_encode($data);