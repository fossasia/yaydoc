"""Prints command to set environment variables from .yaydoc.yml"""
import sys
import os
import argparse
import yaml

from datetime import datetime

# FileNotFoundError is not available on python 2.
# To handle that case, defining it on NameError
# source: https://stackoverflow.com/a/21368622/4127836
try:
    FileNotFoundError
except NameError:
    FileNotFoundError = IOError

def update_dict(base, head):
    """Recursively merge dicts"""
    # https://stackoverflow.com/a/32357112/4127836
    for key, value in head.items():
        if isinstance(base, dict):
            if isinstance(value, dict):
                base[key] = update_dict(base.get(key, {}), value)
            else:
                base[key] = head[key]
        else:
            base = {key: head[key]}
    return base


def _get_default_config(username, reponame):
    # All supported parameters should be defined here
    # Any parameter with no default value should have
    # None as the default set
    utctime = datetime.utcnow().strftime('%b %d, %Y')
    conf = {'metadata': {'projectname': reponame,
                         'version': utctime,
                         'author': username,
                         'subproject': [],
                         'debug': False,
                        },
            'build': {'markdown_flavour': 'markdown_github',
                      'logo': '',
                      'doctheme': 'fossasia_theme',
                      'docpath': 'docs',
                      'python_package': None,
                     },
            'publish': {'ghpages': {'docurl': None,
                                   }
                       },
           }
    return conf


def _get_yaml_config():
    try:
        with open('.yaydoc.yml', 'r') as file:
            conf = yaml.safe_load(file)
    except FileNotFoundError:
        return {}
    return conf


def _get_env_dict(conf):
    # Add new environment variables in the returned dict
    metadata = conf['metadata']
    build = conf['build']
    publish = conf['publish']

    subproject = metadata['subproject']
    if not isinstance(subproject, list):
        subproject = [subproject]
    
    return {'PROJECTNAME': metadata['projectname'],
            'VERSION': metadata['version'],
            'AUTHOR': metadata['author'],
            'SUBPROJECT_URLS': ','.join(project['url']
                                        for project in subproject),
            'SUBPROJECT_DOCPATHS': ','.join(project.get('docpath', 'docs')
                                            for project in subproject),
            'DEBUG': "true" if metadata['debug'] is True else "false",

            'MARKDOWN_FLAVOUR': build['markdown_flavour'],
            'LOGO': build['logo'],
            'DOCTHEME': build['doctheme'],
            'DOCPATH': build['docpath'],
            'PYTHON_PACKAGE': build['python_package'],

            'DOCURL': publish['ghpages']['docurl'],
           }

def _export_env(envdict):
    # appends command to export environment variables from dictionary
    # keys are converted to upper case before creating variables
    commands = []
    fmtstr = 'export {key}="{value}"'
    for key, value in envdict.items():
        # This also overrides environment variables with empty string as
        # value so, key not in os.environ would not work here
        if os.environ.get(key, '') == '' and value is not None:
            commands.append(fmtstr.format(key=key, value=str(value)))
    return '\n'.join(commands) + '\n'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('username', help='Owner of the repository')
    parser.add_argument('reponame', help='Name of the repository')
    args = parser.parse_args()

    conf = _get_default_config(args.username, args.reponame)
    update_dict(conf, _get_yaml_config())

    command = _export_env(_get_env_dict(conf))
    sys.stdout.write(command)


if __name__ == '__main__':
    main()
