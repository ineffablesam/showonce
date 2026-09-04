import { Config } from '@remotion/cli/config'

// The raw screen recording is 1920x1080 @ 60fps. We match that exactly so
// every cue timestamp lines up frame-for-frame with what Gemini/Whisper
// report back in seconds (frame = round(seconds * 60)).
Config.setVideoImageFormat('png')
Config.setOverwriteOutput(true)
Config.setPixelFormat('yuva444p10le')
Config.setCodec('prores')
Config.setProResProfile('4444')
