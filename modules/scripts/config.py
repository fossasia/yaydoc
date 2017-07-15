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
                      'doctheme': 'sphinx_fossasia_theme',
                      'docpath': 'docs',
                      'autoapi': [],
                      'mock': [],
                     },
            'publish': {'ghpages': {'docurl': None,},
                        'heroku': {'app_name': None,},
                       },
            'apidocs': {'name': None,
                        'url': None,
                        'ui': None,
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


def boolean_field(value):
    # This should be used for parameters which are boolean in nature
    # and in the bash script needs a value `true` or `false`
    return "true" if value is True else "false"


def multi_field(value, attr=None, default=None):
    # This should be used for fields which can take multiple values.
    # `value` should be a list. If it is not a list, a list will be created
    # with `value` as it's only element. `attr` can be used if the list is
    # comprised of dictionaries and you only need values for one of the keys.
    # `default` can be used for handling missing keys.
    if not isinstance(value, list):
        value = [value]
    if attr is not None:
        value_ = []
        for _ in value:
            try:
                value_.append(_[attr])
            except (IndexError, KeyError):
                if default is None:
                    raise
                else:
                    value_.append(default)
        return ','.join(value_)
    return ','.join(value)


def _get_env_dict(conf):
    # Add new environment variables in the returned dict
    metadata = conf['metadata']
    build = conf['build']
    publish = conf['publish']
    apidocs = conf['apidocs']

    # TODO autoapi should also be handled using some kind of fields.
    autoapi = build['autoapi']
    if not isinstance(autoapi, list):
        autoapi = [autoapi]

    autoapi_paths = {section['language']: section.get('path', '.')
                     for section in autoapi}
    
    return {'PROJECTNAME': metadata['projectname'],
            'VERSION': metadata['version'],
            'AUTHOR': metadata['author'],
            'SUBPROJECT_URLS': multi_field(metadata['subproject'], 'url'),
            'SUBPROJECT_DOCPATHS': multi_field(metadata['subproject'],
                                               'docpath', 'docs'),
            'DEBUG': boolean_field(metadata['debug']),

            'MARKDOWN_FLAVOUR': build['markdown_flavour'],
            'LOGO': build['logo'],
            'DOCTHEME': build['doctheme'],
            'DOCPATH': build['docpath'],

            'AUTOAPI_PYTHON': boolean_field('python' in autoapi_paths),
            'AUTOAPI_PYTHON_PATH': autoapi_paths.get('python', '.'),

            'AUTOAPI_JAVA': boolean_field('java' in autoapi_paths),
            'AUTOAPI_JAVA_PATH': autoapi_paths.get('java', '.'),

            'MOCK_MODULES': multi_field(build['mock']),

            'DOCURL': publish['ghpages']['docurl'],
            'HEROKU_APP_NAME': publish['heroku']['app_name'],

            'APIDOCS_NAME': apidocs['name'],
            'APIDOCS_URL': apidocs['url'],
            'APIDOCS_UI': apidocs['ui'],
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
