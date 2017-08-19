import os
import sys
import argparse
from datetime import datetime

# Insert package to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), os.pardir))

from config.configuration import Configuration
from config.reader import YAMLConfigurationReader
from config.utils import update_dict, get_bash_command
from config.callbacks import (github_btn_callback, autoapi_python_source,
                              autoapi_java_source, theme_options_keys,
                              theme_options_values)
from config.validation import (validate_markdown_flavour, validate_subproject,
                               validate_mimetype_image)


def get_default_config(owner, repo):
    """Helper function which returns the default configuration"""
    utctime = datetime.utcnow().strftime('%b %d, %Y')
    conf = {'metadata': {'projectname': repo,
                         'version': utctime,
                         'author': owner,
                         'debug': False,
                         'autoindex': {'include': ['README.md', 'README.rst'],
                                       'subproject': {'show': True,
                                                      'heading': 'Sub Projects',
                                                     },
                                       'toc': {'show': True,
                                               'heading': 'Contents',
                                              },
                                       'apidoc': {'show': True,
                                                  'heading': 'API Documentation',
                                                  'javadoc': {'show': True,
                                                             },
                                                  'swagger': {'show': True,
                                                             },
                                                 },
                                       'rss': {'heading': 'RSS',
                                               'url': None,
                                              },
                                       'twitter': {'heading': 'Tweets',
                                                   'query': None,
                                                  },
                                       },
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


def get_envdict(yaml_config, default_config):
    """Helper method which returns the environment dict

    Parameters
    ----------
    yaml_config: Configuration
        `Configuration` object read from the yaml file

    default_config: Configuration
        `Configuration` object created using the default config
    """
    conf_dict = update_dict(default_config.as_dict(), yaml_config.as_dict(), [])
    config = Configuration(conf_dict)

    config.connect('PROJECTNAME', 'metadata.projectname')
    config.connect('VERSION', 'metadata.version')
    config.connect('AUTHOR', 'metadata.author')
    config.connect('DEBUG', 'metadata.debug')
    config.connect('AUTOINDEX_INCLUDE_FILES', 'metadata.autoindex.include@')
    config.connect('AUTOINDEX_INCLUDE_TOC', 'metadata.autoindex.toc.show')
    config.connect('AUTOINDEX_TOC_HEADING', 'metadata.autoindex.toc.heading')
    config.connect('AUTOINDEX_INCLUDE_SUBPROJECT', 'metadata.autoindex.subproject.show')
    config.connect('AUTOINDEX_SUBPROJECT_HEADING', 'metadata.autoindex.subproject.heading')
    config.connect('AUTOINDEX_INCLUDE_APIDOC', 'metadata.autoindex.apidoc.show')
    config.connect('AUTOINDEX_APIDOC_HEADING', 'metadata.autoindex.apidoc.heading')
    config.connect('AUTOINDEX_INCLUDE_JAVADOC', 'metadata.autoindex.apidoc.javadoc.show')
    config.connect('AUTOINDEX_INCLUDE_SWAGGER', 'metadata.autoindex.apidoc.swagger.show')
    config.connect('AUTOINDEX_RSS_HEADING', 'metadata.autoindex.rss.heading')
    config.connect('AUTOINDEX_RSS_URL', 'metadata.autoindex.rss.url')
    config.connect('AUTOINDEX_TWEETS_HEADING', 'metadata.autoindex.twitter.heading')
    config.connect('AUTOINDEX_TWEETS_QUERY', 'metadata.autoindex.twitter.query')

    config.connect('MARKDOWN_FLAVOUR', 'build.markdown_flavour', validate=validate_markdown_flavour)
    config.connect('LOGO', 'build.logo', validate=validate_mimetype_image)
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

    config.connect('SUBPROJECT_URLS', 'build.subproject@url', validate=validate_subproject)
    config.connect('SUBPROJECT_DOCPATHS', 'build.subproject@source', default='docs', validate=validate_subproject)

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


def main():
    """Main function of this script. Reads from a file named `.yaydoc.yml`.
    Expects `OWNER` and `REPONAME` environment variables to be set."""
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--source', default='.yaydoc.yml', help='Path to yaml file')
    args = parser.parse_args()

    owner = os.environ.get('OWNER', '')
    repo = os.environ.get('REPONAME', '')
    yaml_config = YAMLConfigurationReader(args.source).read()
    default_config = get_default_config(owner, repo)
    envdict = get_envdict(yaml_config, default_config)
    bash_command = get_bash_command(envdict)
    sys.stdout.write(bash_command)


if __name__ == '__main__':
    main()
