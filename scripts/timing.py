"""Timing helpers for build.py — every cue is a spoken word.

    from timing import Timeline
    T = Timeline("timings.json", hold=2.0)      # hold = seconds kept after the last word
    T.DUR[n], T.OFF[n], T.TOTAL                 # shot lengths / offsets (cut mid-pause)
    T.W(n, "word", occ=1)    -> local start time of the occ-th "word" in shot n
    T.WE(n, "word", occ=1)   -> local end time
    T.WS(n, "from", "to", oa=1, ob=1) -> list of local start times, from..to inclusive

Words are matched case- and punctuation-insensitively ("I'm" -> "im",
"twenty-five" -> "twentyfive"). A KeyError names the shot and word so a
wrong occurrence is caught at build time, not on screen."""
import json, re

def _n(w): return re.sub(r"[^a-z0-9]", "", w.lower())

class Timeline:
    def __init__(self, path, hold=2.0):
        t = json.load(open(path))
        self.P = t["paras"]
        cuts = [0.0] + [round((self.P[i]["end"] + self.P[i + 1]["start"]) / 2, 2) for i in range(len(self.P) - 1)] \
               + [round(max(t["duration"], self.P[-1]["end"]) + hold, 2)]
        self.DUR = {k + 1: round(cuts[k + 1] - cuts[k], 2) for k in range(len(self.P))}
        self.OFF, acc = {}, 0.0
        for k in sorted(self.DUR):
            self.OFF[k] = round(acc, 2); acc += self.DUR[k]
        self.TOTAL = round(acc, 2)

    def _idx(self, n, word, occ):
        hits = [i for i, (w, s, e) in enumerate(self.P[n - 1]["words"]) if _n(w) == _n(word)]
        if len(hits) < occ:
            raise KeyError(f"shot {n}: word '{word}' occurrence {occ} not found "
                           f"(found {len(hits)}). Words: {' '.join(w for w,_,_ in self.P[n-1]['words'])}")
        return hits[occ - 1]
    def W(self, n, word, occ=1):  return round(self.P[n - 1]["words"][self._idx(n, word, occ)][1] - self.OFF[n], 2)
    def WE(self, n, word, occ=1): return round(self.P[n - 1]["words"][self._idx(n, word, occ)][2] - self.OFF[n], 2)
    def WS(self, n, a, b, oa=1, ob=1):
        i, j = self._idx(n, a, oa), self._idx(n, b, ob)
        return [round(self.P[n - 1]["words"][k][1] - self.OFF[n], 2) for k in range(i, j + 1)]
    def tc(self, n):
        f = lambda s: "%d:%02d" % (int(s) // 60, int(s) % 60)
        return f"{f(self.OFF[n])}&ndash;{f(self.OFF[n] + self.DUR[n])}"
