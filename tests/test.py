import os, sys
import unittest
from mock import patch

# Inserting modules/scripts to sys.path so we can import modules from it
sys.path.insert(0, os.path.abspath(os.path.join('modules', 'scripts')))

import config
import linkfix
import genindex


class ConfigTestCase(unittest.TestCase):
    def test_update_dict(self):
        """Tests recursive merging of dictionaries"""
        head = {'1': 1, '2': {'a': 3, 'b': 4}}
        base = {'1': 2, '2': {'b': 5}}
        updated_dict = config.update_dict(head, base)
        self.assertEqual(updated_dict, {'1': 2, '2': {'a': 3, 'b': 5}})

    @patch.dict(os.environ, {'ENV2': 'val2', 'ENV4': ''}, True)
    def test_export_env(self):
        """Tests whether correct variables are exported"""
        envdict = {'ENV1': 'val1', 'ENV2': 'val2', 'ENV3': None, 'ENV4': 'val4'}
        exported_env = config._export_env(envdict).strip('\n').split('\n')
        self.assertTrue('export ENV1="val1"' in exported_env)
        self.assertTrue('export ENV4="val4"' in exported_env)
        self.assertEqual(len(exported_env), 2)


class IndexGenerateTestCase(unittest.TestCase):
    def test_include_directive(self):
        """Tests whether README.rst if present in root is included"""
        text = genindex.get_include(os.curdir, 'README.rst')
        self.assertEqual(text, '.. include:: README.rst')

    def test_mdinclude_directive(self):
        """Tests whether README.md if present in root is included"""
        text = genindex.get_include(os.curdir, 'README.md')
        self.assertEqual(text, '.. mdinclude:: README.md')

    def test_toctree_directive_nodir(self):
        """Tests the output of get_toctree for files at top level of doc_path"""
        text = genindex.get_toctree(os.curdir, ['file1.md', 'file2.rst'])
        self.assertEqual(text, """.. toctree::
   :maxdepth: 1
   :caption: Contents

   file1
   file2""")

    def test_toctree_directive_withdir(self):
        """Tests the output of get_toctree for files under a sub directory"""
        text = genindex.get_toctree('my_dir', ['file1.md', 'file2.rst'])
        self.assertEqual(text, """.. toctree::
   :maxdepth: 1
   :caption: My Dir

   my_dir/file1
   my_dir/file2""")


class RelativeLinkFixTestCase(unittest.TestCase):
    def test_with_markdown(self):
        """Tests whether markdown links are modified correctly"""
        md_content = '[title](docs/directory/file.md)'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path)
        self.assertEqual(new_content, '[title   ](directory/file.html)')

    def test_with_rst(self):
        """Tests whether reStructuredText's links are modified correctly"""
        rst_content = '`title<docs/directory/file>`'
        source_path = os.path.join(os.pardir, 'README.rst')
        new_content = linkfix.fix_relative_links(rst_content, source_path)
        self.assertEqual(new_content, '`title     <directory/file>`')

    def test_with_html(self):
        html_content = '<img src="docs/directory/file">'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(html_content, source_path)
        self.assertEqual(new_content, '<img src="directory/file.html">')

    def test_with_image(self):
        md_content = '![icon](app/src/icons/launcher.png)'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path)
        self.assertEqual(new_content, '![icon](../app/src/icons/launcher.png)')


if __name__ == '__main__':
    unittest.main()
