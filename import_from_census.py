import json
import csv
import urlparse
import urllib
import argparse


def normalize_url(url):

    url = url.lower().strip().rstrip('/')

    if url == 'internal':
        return None

    if not url.startswith('http'):
        url = '//' + url

    parts = urlparse.urlparse(url, scheme='http')

    return urlparse.urlunparse(parts)


def get_instance_id_from_url(url):

    url = normalize_url(url)

    return (url.replace('https://', '')
               .replace('http://', '')
               .replace('.', '_')
               .replace('/', '_'))


def get_instance_id_from_title(title):

    return title.lower().replace(' ', '_').replace('.', '_')


def get_screenshot(url, output_path):

    screenshot_service = 'http://webshot.okfnlabs.org/api/generate?url={url}&width={width}&height={heigth}'
    request_url = screenshot_service.format(
        url=url, width=1024, heigth=768
    )
    urllib.urlretrieve(request_url, output_path)

    print 'Got screenshot for {0}'.format(url)
    # TODO: resize
    # For the time being, just do:
    #   sudo apt-get install imagemagick
    #   for file in *.png; do convert $file -resize 350x250 $file; done


def add_new_instances_from_census(instances_file='config/instances.json',
                                  new_instances_file='config/instances.json',
                                  census_file='census.csv',
                                  get_screenshots=True,
                                  append=True):

    with open(instances_file, 'r') as f:
        instances = json.loads(f.read())

    census_instances = []
    with open(census_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            census_instances.append(row)

    instances_urls = [normalize_url(i['url']) for i in instances if i['url']]

    instances_titles = [i['title'].encode('utf-8').strip() for i in instances]

    missing_instances = []
    done_urls = []
    for instance in census_instances:

        url = normalize_url(instance['URL'])

        if (url not in instances_urls
                and url not in done_urls
                and instance['Site Name'].strip() not in instances_titles
                and instance['CKAN.org Instances Page'] == 'Yes'):

            if url:
                instance_id = get_instance_id_from_url(instance['URL'])
            else:
                instance_id = get_instance_id_from_title(instance['Site Name'])

            new_instance = {
                'id': instance_id,
                'url': url,
                'title': instance['Site Name'],
                'description': instance['Description'],
                'location': instance['Location'],
                'facets': [
                    {'key': 'Region', 'value': instance.get('Region', '')},
                    {'key': 'Type', 'value': instance.get('Type', '')}
                ],
            }

            if url and get_screenshots:
                output_path = 'images/instance/{0}.png'.format(instance_id)
                get_screenshot(url, output_path)

            done_urls.append(new_instance['url'])
            missing_instances.append(new_instance)
            print 'Added instance {0}'.format(new_instance['url'])

    if append:
        instances.extend(missing_instances)
        output_instances = instances
    else:
        output_instances = missing_instances

    with open(new_instances_file, 'wb') as f:
        f.write(
            json.dumps(
                output_instances,
                indent=4,
                separators=(',', ': ')
            ))

    print 'Done, {0} new instances added'.format(len(missing_instances))


if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description='Get new CKAN instances from the Census.')
    parser.add_argument('-i', '--instances-file',
                        default='config/instances.json',
                        help='Existing instances JSON file (default: config/instances.json)')
    parser.add_argument('-n', '--new-instances-file',
                        default='config/instances.json',
                        help='New instances JSON file (default: config/instances.json, ie overwrite)')
    parser.add_argument('-c', '--census-file',
                        default='census.csv',
                        help='CKAN Census CSV file (default: census.csv)')
    parser.add_argument('--screenshots', action='store_true',
                        dest='get_screenshots',
                        help='Get screenshots for new instances (default: true)')
    parser.add_argument('--no-screenshots', action='store_false',
                        dest='get_screenshots')
    parser.add_argument('--append', action='store_true',
                        dest='append',
                        help='Append new instances to existing ones (default: true)')
    parser.add_argument('--no-append', action='store_false',
                        dest='append')

    parser.set_defaults(add_region_facet=True,
                        get_screenshots=True,
                        append=True)

    args = parser.parse_args()

    add_new_instances_from_census(instances_file=args.instances_file,
                                  new_instances_file=args.new_instances_file,
                                  census_file=args.census_file,
                                  get_screenshots=args.get_screenshots,
                                  append=args.append)
