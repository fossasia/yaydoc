import os
import sys
import unittest
from mock import patch

# Inserting modules/scripts to sys.path so we can import modules from it
sys.path.insert(0, os.path.abspath(os.path.join('modules', 'scripts')))

import linkfix
import genindex
import markdown
from config.serializer import serialize, deserialize
from config.utils import update_dict, get_bash_command


class ConfigTestCase(unittest.TestCase):
    def test_update_dict(self):
        """Tests recursive merging of dictionaries"""
        head = {'1': 1, '2': {'a': 3, 'b': 4}}
        base = {'1': 2, '2': {'b': 5}}
        updated_dict = update_dict(head, base, [])
        self.assertEqual(updated_dict, {'1': 2, '2': {'a': 3, 'b': 5}})

    @patch.dict(os.environ, {'ENV2': 'val2', 'ENV4': ''}, True)
    def test_bash_command(self):
        """Tests whether correct variables are exported"""
        envdict = {'ENV1': 'val1', 'ENV2': 'val2', 'ENV3': None, 'ENV4': 'val4'}
        command = get_bash_command(envdict).strip('\n').split('\n')
        self.assertTrue('export ENV1="val1"' in command)
        self.assertTrue('export ENV4="val4"' in command)
        self.assertEqual(len(command), 2)


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
        text = genindex.get_toctree(os.curdir, ['file1.md', 'file2.rst'], 1)
        self.assertEqual(text, """Contents
========

.. toctree::
   :maxdepth: 1

   file1
   file2""")

    def test_toctree_directive_withdir(self):
        """Tests the output of get_toctree for files under a sub directory"""
        text = genindex.get_toctree('my_dir', ['file1.md', 'file2.rst'], 1)
        self.assertEqual(text, """My Dir
======

.. toctree::
   :maxdepth: 1

   my_dir/file1
   my_dir/file2""")

    def test_heading(self):
        text = genindex.get_heading('Heading', 1)
        self.assertEqual(text, """Heading
=======""")


class RelativeLinkFixTestCase(unittest.TestCase):
    def test_with_markdown(self):
        """Tests whether markdown links are modified correctly"""
        md_content = '[title](docs/directory/file.md)'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path, source_path)
        self.assertEqual(new_content, '[title   ](directory/file.html)')

    def test_with_rst(self):
        """Tests whether reStructuredText's links are modified correctly"""
        rst_content = '`title<docs/directory/file>`'
        source_path = os.path.join(os.pardir, 'README.rst')
        new_content = linkfix.fix_relative_links(rst_content, source_path, source_path)
        self.assertEqual(new_content, '`title     <directory/file>`')

    def test_with_html(self):
        html_content = '<img src="docs/directory/file">'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(html_content, source_path, source_path)
        self.assertEqual(new_content, '<img src="directory/file.html">')

    def test_with_image(self):
        md_content = '![icon](app/src/icons/launcher.png)'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path, source_path)
        self.assertEqual(new_content, '![icon](../app/src/icons/launcher.png)')

    def test_static_path(self):
        md_content = '![icon](docs/_static/images/login.png)'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path, source_path)
        self.assertEqual(new_content, '![icon     ](_static/images/login.png)')

    def test_static_path_depth2(self):
        md_content = '![icon](docs/_static/images/login.png)'
        source_path = os.path.join(os.pardir, os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path, source_path)
        self.assertEqual(new_content, '![icon     ](_static/images/login.png)')

    def test_static_path_subproject(self):
        md_content = '![icon](docs/_static/images/login.png)'
        source_path = os.path.join(os.pardir, 'README.md')
        abs_source_path = os.path.join('subrepo', 'README.md')
        new_content = linkfix.fix_relative_links(md_content, abs_source_path, source_path)
        self.assertEqual(new_content, '![icon](../../_static/images/login.png)')

    def test_local_markdown_link(self):
        md_content = '[title](#section)'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path, source_path)
        self.assertEqual(new_content, '[title](#section)')

    def test_local_rst_link(self):
        md_content = '`title<#section>`'
        source_path = os.path.join(os.pardir, 'README.md')
        new_content = linkfix.fix_relative_links(md_content, source_path, source_path)
        self.assertEqual(new_content, '`title<#section>`')


class SerializationTestCase(unittest.TestCase):
    def test_with_bool(self):
        self.assertEqual(serialize(True), "true")
        self.assertEqual(serialize(False), "false")

    def test_none(self):
        self.assertEqual(serialize(None), "")

    def test_int_list(self):
        self.assertEqual(serialize([1,2,3]), "[1,2,3]")

    def test_string_list(self):
        self.assertEqual(serialize(["qw","asd","zxcv"]),
                         "[qw,asd,zxcv]")

    def test_nested_list(self):
        self.assertEqual(serialize([True, [1, None], "Hello", [False]]),
                         "[true,[1,],Hello,[false]]")

    def test_empty_list(self):
        self.assertEqual(serialize([]), "[]")


class DeserializationTestCase(unittest.TestCase):
    def test_with_bool(self):
        self.assertEqual(deserialize("True"), True)
        self.assertEqual(deserialize("False"), False)
        self.assertEqual(deserialize("true"), True)
        self.assertEqual(deserialize("false"), False)

    def test_int_list(self):
        self.assertEqual(deserialize("[1,2,3]"),
                         [1,2,3])

    def test_int_list_no_numeric(self):
        self.assertEqual(deserialize("[1,2,3]", numeric=False),
                         ['1','2','3'])

    def test_string_list(self):
        self.assertEqual(deserialize("[qw,asd,zxcv]"),
                         ['qw','asd','zxcv'])

    def test_nested_list(self):
        self.assertEqual(deserialize("[true,[1,],Hello,[false]]"),
                         [True, [1, ''], "Hello", [False]])

    def test_empty_list(self):
        self.assertEqual(deserialize("[]"), [])


class MarkdownPlusTestCase(unittest.TestCase):
    def test_markdown_plus(self):
        self.maxDiff = None
        md_content = """Header
<!-- markdown+ -->
| Column 1 | Column 2 |
|----------|----------|
| Data 1 | Data 2   |
| Data 3   | Data 4  |
| Data 5 | Data 6 |
<!-- endmarkdown+ -->
Footer
"""
        new_content = """Header
```eval_rst
+------------+------------+
| Column 1   | Column 2   |
+============+============+
| Data 1     | Data 2     |
+------------+------------+
| Data 3     | Data 4     |
+------------+------------+
| Data 5     | Data 6     |
+------------+------------+

```
Footer
"""
        self.assertEqual(markdown.preprocess_markdown(md_content), new_content)


if __name__ == '__main__':
    unittest.main()
