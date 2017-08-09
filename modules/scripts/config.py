"""Prints command to set environment variables from .yaydoc.yml"""
import os
import sys
import argparse
from datetime import datetime
from functools import partial
import yaml

from serializer import serialize


class Configuration(object):
    """Wrap a dictionary and provide certain helper methods.
    Adds ability to access nested values using dotted keys.

    Parameters
    ----------
    conf_dict: dict
        A dictionary which should be wrapped. If not provided, an empty
        configuration object is created.

    Examples
    --------
    >>> my_dict = {'key1': {'nestedkey1: 'value1'}, 'key2': 'value2'}
    >>> conf = Configuration(my_dict)
    >>> print(conf['key1.nestedkey1'])
    value1
    >>> print(conf['key2'])
    value2
    """
    def __init__(self, conf_dict=None):
        self._conf = conf_dict if conf_dict is not None else dict()
        self._connections = {}

    def __getitem__(self, key_string):
        data = self._conf
        for key in key_string.split('.'):
            data = data[key]
        return data

    def __setitem__(self, key, value):
        self._conf[key] = value

    def __contains__(self, key_string):
        data = self._conf
        for key in key_string.split('.'):
            try:
                data = data[key]
            except KeyError:
                return False
        return True

    def as_dict(self):
        """Return a new copy of the internal dictionary"""
        return dict(self._conf)

    def connect(self, env_var, key_string, **kwargs):
        """Connect environment variables with dictionary keys.

        You can append an @ at the end of key_string to denote that the given
        field can take multiple values. Anything after the @ will be assumed
        to be an attribute which should be extracted from the list of those
        multiple values.

        Parameters
        ----------
        env_var: str
            The name of the environment variable.

        key_string: str
            Similar to the dotted key but also provides an extension
            where you can extract attributes from a list of dicts using @.

        contains: bool
            If true, will set whether the given key_string exists. `callback`,
            `default` will be ignored.

        default: object
            This will only be used with @ when the provided attribute is not
            present in a member of a list.

        callback: callable
            If present, the extracted value using the key_string will be
            passed to the callback. The callback's return value would be
            used as the new value
        """
        contains = kwargs.get('contains', False)
        default = kwargs.get('default', None)
        callback = kwargs.get('callback', None)
        try:
            ks_split = key_string.split('@')
            attr = ks_split[1]
            key_string = ks_split[0]
            multi_field = True
        except IndexError:
            multi_field = False

        if contains:
            data = key_string in self
        else:
            data = self[key_string]
            if multi_field:
                if not isinstance(data, list):
                    data = [data]
                if attr:
                    data_ = []
                    for element in data:
                        try:
                            data_.append(element[attr])
                        except KeyError:
                            if default is None:
                                raise
                            else:
                                data_.append(default)
                    data = data_
            if callback:
                data = callback(data)
        self._connections[env_var] = data

    def getenv(self, seperator=','):
        """Return a dict with the connected environment variables as keys
        and the extracted values as values"""

        dict_ = {}
        for envvar, value in self._connections.items():
            dict_[envvar] = serialize(value)
        return dict_

    def get(self, key_string, default=None):
        """Similar to the dict's get method"""
        try:
            return self[key_string]
        except KeyError:
            return default


class YAMLConfigurationReader(object):
    """Provides method to read yaml data from a file

    Parameters
    ----------
    file: str or file-like object
        Strings are considered to be a file name else it is assumed to be
        a file-like object.
    """
    def __init__(self, file):
        self._file = file

    def read(self):
        """Return a `Configuration` object read from the specified file"""
        if isinstance(self._file, str):
            try:
                with open(os.path.normpath(self._file), 'r') as file:
                    return Configuration(yaml.safe_load(file))
            except IOError:
                return Configuration()
        return Configuration(yaml.safe_load(self._file))


def get_default_config(owner, repo):
    """Helper function which returns the default configuration"""
    utctime = datetime.utcnow().strftime('%b %d, %Y')
    conf = {'metadata': {'projectname': repo,
                         'version': utctime,
                         'author': owner,
                         'debug': False,
                        },
            'build': {'markdown_flavour': 'markdown_github',
                      'logo': '',
                      'theme': {'name': 'sphinx_fossasia_theme',
                                'options': {},
                               },
                      'source': 'docs',
                      'autoapi': [],
                      'mock': [],
                      'subproject': [],
                      'github_ribbon': {'position': 'right',
                                        'color': 'red',
                                       },
                      'github_button': {'buttons': {'watch': True,
                                                    'star': True,
                                                    'fork': True,
                                                    'issues': True,
                                                    'follow': True
                                                   },
                                        'show_count': True,
                                        'large': True,
                                       },
                     },
            'publish': {'ghpages': {'url': None,},
                        'heroku': {'app_name': None,},
                       },
            'extras': {'swagger': {'url': None,
                                   'ui': 'swagger',
                                  },
                       'javadoc': {'path': None,},
                      },
           }
    return Configuration(conf)


def update_dict(base, head):
    """Utility method which recursively merge dicts"""
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


def get_envdict(yaml_config, default_config):
    """Helper method which returns the environment dict

    Parameters
    ----------
    yaml_config: Configuration
        `Configuration` object read from the yaml file

    default_config: Configuration
        `Configuration` object created using the default config
    """
    def autoapi_source_helper(autoapi, language):
        """Helper method to be used as a callback for extracting the
        source path for a particular language."""
        for section in autoapi:
            if section['language'] == language:
                return section.get('source', '.')
        return '.'

    def theme_options_helper(options, index):
        """Helper method to be used as a callback for extracting the
        keys and values for theme options."""
        return [option[index] for option in options.items()]

    def github_btn_callback(btns):
        btn_list = []
        for btn_type in ('watch', 'star', 'issues', 'fork', 'follow'):
            if btns[btn_type] is True:
                btn_list.append(btn_type)
        return btn_list

    autoapi_python_source = partial(autoapi_source_helper, language='python')
    autoapi_java_source = partial(autoapi_source_helper, language='java')

    theme_options_keys = partial(theme_options_helper, index=0)
    theme_options_values = partial(theme_options_helper, index=1)

    config = Configuration(update_dict(default_config.as_dict(), yaml_config.as_dict()))

    config.connect('PROJECTNAME', 'metadata.projectname')
    config.connect('VERSION', 'metadata.version')
    config.connect('AUTHOR', 'metadata.author')
    config.connect('DEBUG', 'metadata.debug')

    config.connect('MARKDOWN_FLAVOUR', 'build.markdown_flavour')
    config.connect('LOGO', 'build.logo')
    config.connect('DOCTHEME', 'build.theme.name')
    config.connect('DOCTHEME_OPTIONS_KEYS', 'build.theme.options', callback=theme_options_keys)
    config.connect('DOCTHEME_OPTIONS_VALUES', 'build.theme.options', callback=theme_options_values)
    config.connect('DOCPATH', 'build.source')
    config.connect('MOCK_MODULES', 'build.mock@')

    config.connect('GITHUB_RIBBON_COLOR', 'build.github_ribbon.color')
    config.connect('GITHUB_RIBBON_POSITION', 'build.github_ribbon.position')

    config.connect('GITHUB_BUTTONS', 'build.github_button.buttons', callback=github_btn_callback)
    config.connect('GITHUB_BUTTON_LARGE', 'build.github_button.large')
    config.connect('GITHUB_BUTTON_SHOW_COUNT', 'build.github_button.show_count')

    config.connect('SUBPROJECT_URLS', 'build.subproject@url')
    config.connect('SUBPROJECT_DOCPATHS', 'build.subproject@source', default='docs')

    config.connect('AUTOAPI_PYTHON', 'build.autoapi@language', callback=lambda x: 'python' in x)
    config.connect('AUTOAPI_JAVA', 'build.autoapi@language', callback=lambda x: 'java' in x)
    config.connect('AUTOAPI_PYTHON_PATH', 'build.autoapi@', callback=autoapi_python_source)
    config.connect('AUTOAPI_JAVA_PATH', 'build.autoapi@', callback=autoapi_java_source)

    config.connect('DOCURL', 'publish.ghpages.url')
    config.connect('HEROKU_APP_NAME', 'publish.heroku.app_name')

    config.connect('SWAGGER_SPEC_URL', 'extras.swagger.url')
    config.connect('SWAGGER_UI', 'extras.swagger.ui')
    config.connect('JAVADOC_PATH', 'extras.javadoc.path')

    yaml_config.connect('GITHUB_RIBBON_ENABLE', 'build.github_ribbon', contains=True)
    yaml_config.connect('GITHUB_BUTTON_ENABLE', 'build.github_button', contains=True)

    envdict = config.getenv()
    envdict.update(yaml_config.getenv())
    return envdict


def get_bash_command(envdict):
    """Return the bash command as a string which should be eval'd

    Parameters
    ----------
    envdict: dict
        The dict returned by `get_envdict`
    """
    commands = []
    fmtstr = 'export {key}="{value}"'
    for key, value in envdict.items():
        if os.environ.get(key, '') in ('', '[]') and value is not None:
            commands.append(fmtstr.format(key=key, value=str(value)))
    return '\n'.join(commands) + '\n'


def main():
    """Main function of this script. Reads from a file named `.yaydoc.yml`.
    Expects `OWNER` and `REPONAME` environment variables to be set."""
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', '--file', default='.yaydoc.yml', help='Path to yaml file')
    args = parser.parse_args()

    owner = os.environ.get('OWNER', '')
    repo = os.environ.get('REPONAME', '')
    yaml_config = YAMLConfigurationReader(args.file).read()
    default_config = get_default_config(owner, repo)
    envdict = get_envdict(yaml_config, default_config)
    bash_command = get_bash_command(envdict)
    sys.stdout.write(bash_command)


if __name__ == '__main__':
    main()
