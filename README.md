This is the repo for the iframe within http://ckan.org/instances/

How do I add my CKAN instance?
==============================

Just add it to the [CKAN Census](http://ckan.org/census/)!


Script for importing instances from the census
==============================================

TODO: Automate all this stuff!

If you have push rights on this repo, you can import instances from a CSV export of the
Census Google Spreadsheet using the `import_from_census.py` script.

Assuming you exported the Census to `census.csv` and placed on the same directory, you
can run:

    python import_from_census.py

By default, this will modify the `config/instances.json` file in place and download a
screenshot of the new sites. Run `python import_from_census.py -h` to see all the available options.

*Screenshots need to be resize manually*, as the screenshot service (http://webshot.okfnlabs.org)
does not support it.

You can use eg:

    sudo apt-get install imagemagick
    for file in *.png; do convert $file -resize 350x250 $file; done

Review the changes and push them to the `gh-pages` branch to make them public.



