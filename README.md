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

## Generate the datapoints:
In order to see specific datapoint to annotate, you will first need to generate a `data_for_mturk.json` file and save it under the `data` folder.
To do that, follow the following steps:
0. install the conda environment `controlled_reduction` and activate it:
```
conda env create -f generate_input_json_file/controlled_reduction.yml
conda activate controlled_reduction
```
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
python3 generate_input_json_file\create_json_for_mturk.py -i <DATA_PATH> -o <JSON_FOR_MTURK_OUTPUT_PATH> --coref-cluster-json /path/to/coref_clusters.json
```
`<DATA_PATH>` is the same as before, and `/path/to/coref_clusters.json` should be `<SPACY_TOKENIZATION_OUTPUT_PATH>/coref_clusters.json` (the output of the code in step 1)

Finally, in `<JSON_FOR_MTURK_OUTPUT_PATH>` you will find the `data_for_mturk.json` which should be placed in the `data` folder.

## Watch a specific datapoint:
Once `data_for_mturk.json` was generated and placed in the `data` folder, to annotate a specific datapoint:
1. activate the app:
```
npm start
```
2. when the url is activated, add to it `id=<DATAPOINT_ID>` parameter, where `<DATAPOINT_ID>` is the serial index of the datapoint in the `<DATA_PATH>` folder (beginning with 0). For example:
```
http://localhost:3000/?id=0
```
would load the first sommar-document pair in `<DATA_PATH>` to annotate.

## Connect to mturk
The app is designed to be incorporated into the mturl platform.
To do that:
1. generate the relevant `data_for_mturk.json`
2. build the app, by running:
```
npm run build
```
This will build the application and save it in a build folder.
3. open a web-hosting platform (e.g. platformanywhere) and copy there the following folders: `backend` and `build`, as well as the files `package.json` and `package-lock.json`

Now, you can upload to mturk the hits using the url of the web-hosting platform, combined with the `id`s of your document-summary pairs. In other words, each combination of the url of the web-hosting platform with an `id` parameter would be a single hit. For example:
```
https://<USER_NAME>.pythonanywhere.com/?id=0
```
would upload the first document-summary pair.
## Building:
To build the UI for production to the `build` folder, run:
```
npm run build
```
Then, to load the UI to port 8000 (for example), run:
```
serve -s build -p 8000
```

Citation
========
If you find this repository useful in your research, please cite the following paper:
```
@misc{https://doi.org/10.48550/arxiv.2210.13449,
  doi = {10.48550/ARXIV.2210.13449},
  url = {https://arxiv.org/abs/2210.13449},
  author = {Slobodkin, Aviv and Roit, Paul and Hirsch, Eran and Ernst, Ori and Dagan, Ido},
  keywords = {Computation and Language (cs.CL), FOS: Computer and information sciences, FOS: Computer and information sciences},
  title = {Controlled Text Reduction},
  publisher = {arXiv},
  year = {2022},
  copyright = {Creative Commons Zero v1.0 Universal}
}

```
