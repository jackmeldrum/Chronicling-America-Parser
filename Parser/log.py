# Relevant resources:
# https://stackoverflow.com/questions/287871/print-in-terminal-with-colors
# https://superuser.com/questions/413073/windows-console-with-ansi-colors-handling

import sys

DEBUG = 4
INFO  = 3
WARN  = 2
ERROR = 1

level = 0
verbosity = INFO
space = '\t'
    
def set_config(v, s):
    global verbosity
    global space
    verbosity = v
    space = s

def indent():
    global level
    level = min(7, level + 1)

def dedent():
    global level
    level = max(0, level - 1)

def _log(v, c, s):
    if verbosity >= v:
        print(c + ': ' + space * level + s + '\033[0m', file=sys.stderr)

def debug(s=""):
    _log(DEBUG, '\033[94mD', str(s))

def info(s=""):
    _log(INFO, 'I', str(s))

def warn(s=""):
    _log(WARN, '\033[93mW', str(s))

def error(s=""):
    _log(ERROR, '\033[91mE', str(s))
