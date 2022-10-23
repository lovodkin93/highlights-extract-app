# Getting Started 
First, clone this repository:
```
git clone https://github.com/lovodkin93/highlights-extract-app.git
cd highlights-extract-app
```
then, run:
```
npm install
npm i react
```
to install all the packages used in this project and serve (which will be used to build the project for production).

## Development Mode:
To start working with the UI, run:
```
npm start
```

This will run the UI in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

In order to see specific datapoint to annotate, you will first need to generate a `data_for_mturk.json` file and save it under the `data` folder.
To do that, follow the following steps:
1. run
```
python3 generate_input_json_file\get_coref_clusters_chr.py -i <DATA_PATH> -o <SPACY_TOKENIZATION_OUTPUT_PATH>
```
`<DATA_PATH>` should contain the following structure where a summary and its related document directory share the same name:
```
      - <DATA_PATH>
        - summaries
          - A.txt
          - B.txt
          - ...
        - A
          - doc_A1
          - doc_A2
          - ...
        - B
          - doc_B1
          - doc_B2
          - ...
```
2. run
```
python3 generate_input_json_file\create_json_for_mturk.py -i <DATA_PATH> -o <JSON_FOR_MTURK_OUTPUT_PATH> --coref-cluster-json /path/to/spacy_tokenization.json
```
`<DATA_PATH>` is the same as before, and `/path/to/spacy_tokenization.json` should be `<SPACY_TOKENIZATION_OUTPUT_PATH>/spacy_tokenization.json` (the output of the code in step 1)

Finally, in `<JSON_FOR_MTURK_OUTPUT_PATH>` you will find the `data_for_mturk.json` which should be placed in the `data` folder.

## Building:
To build the UI for production to the `build` folder, run:
```
npm run build
```
Then, to load the UI to port 8000 (for example), run:
```
serve -s build -p 8000
```
