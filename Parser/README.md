Chronicling America Article Parser
==================================

This program tries to distinguish between different articles on a newspaper page stored in an [ALTO format](https://www.loc.gov/standards/alto/). It is meant to be used for pages gathered from the [Chronicling America website](https://chroniclingamerica.loc.gov/).

This script will download files from the Chronicling America API, read them, and modify them to create annotated image files that describe what the parser sees. The goal is to use this data to create JSON files which will be used to add article information into the C.A. database.


Installation
------------

This program has a few requirements needed to run:
1. [Python](https://www.python.org/downloads/) (≥ v3.5.2)
2. [OpenJPEG](http://www.openjpeg.org/) (≥ v2.0.0)  
   You'll need to [download the source code](https://github.com/uclouvain/openjpeg/releases/latest) and [install it locally](https://github.com/uclouvain/openjpeg/blob/master/INSTALL.md).  
   Remember to install *its* dependencies as well. For Ubuntu, it's:
   ```sh
   sudo apt-get install liblcms2-dev libtiff-dev libpng-dev libz-dev
   ```
3. [Pillow](https://pillow.readthedocs.io/en/latest/installation.html) (≥ v2.4.0)

Python and OpenJPEG can be installed in whichever order, but Pillow *must* be installed after OpenJPEG. Otherwise you risk having Pillow not compile with JPEG-2000 support, and won't be able to read the `.jp2` image files that C.A. serves.


Usage
-----

To use the program, run it through the python interpreter:

```sh
python3 main.py [options...]
```

The program will then start downloading files from the Library of Congress into an `lccn/` directory that it will generate itself. The program downloads pages and its files one at a time, and delete them once it's done with them.

### Options

* `--start PAGE` – Starts processing batches from the given batch page number `PAGE`. In case you need this, know that there's 25 batches per page, and the output will show the current batch page number at the start of processing.
* `--annotate` — Downloads image scans and annotates them (for debugging and testing purposes).
* `-q` or `--quiet` — Shows only warnings and errors while running.
* `-v` or `--verbose` — Shows debug information while running. Has precedence over `-q`.
