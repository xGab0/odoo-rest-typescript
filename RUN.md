/Users/gabriele/Desktop/repositories/odoo-rest-typescript/odoo/16.0/src/odoo-bin
-c "/Users/gabriele/Desktop/repositories/odoo-rest-typescript/odoo/16.0/odoo.conf" -u odoo-rest

/Users/gabriele/Desktop/repositories/odoo-rest-typescript/python/venv/bin/python3 /Users/gabriele/Desktop/repositories/odoo-rest-typescript/odoo/16.0/src/odoo-bin -c /Users/gabriele/Desktop/repositories/odoo-rest-typescript/odoo/16.0/odoo.conf -u odoo-rest

- Python Virtual Environment setup:
  1.  Run the following command to create the python venv in a directory as your choosing
      ```bash
        python3 -m venv {venv_directory}
      ```

  2.  To launch the python dev go to the directory you choosen and if you're using fish run
      ```bash
        source activate.fish
      ```

      Otherwise, if you're using Windows or another Shell:
      ```bash
        source activate
      ```

  3.  The venv will automatically have the pip manager installed but it may be outdated, run the following command to update it:
      ```bash
      pip install --upgrade pip
      ```

  4.  Now you must install the dependencies with pip to run Odoo: go to the
      Odoo directory and copy the path for the requirements file
      ```bash
        pip3 install -r {odoo_directory}/requirements.txt
      ```
