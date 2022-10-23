
import argparse
import json
import os
import spacy
import pandas as pd
import numpy as np
import csv
from difflib import SequenceMatcher
import neuralcoref
from tqdm import tqdm

def get_sent_id(tkn):
    sentence = [i for i, sent in enumerate(tkn.doc.sents) if sent == tkn.sent]
    if len(sentence) > 1:
        print("ERROR: identical sentences!")
        exit()
    return sentence[0]


def get_idx_of_final_span_word(end_i, tokenized_doc):
    return [elem.idx for elem in tokenized_doc if elem.i==end_i-1][0]



def paragraph_division(tokenized_doc):
    # find coreferred tkns (in chars)
    coref_chr_clusters = [sorted([elem.start_char for elem in cluster] + [get_idx_of_final_span_word(elem.end, tokenized_doc) for elem in cluster]) for cluster in tokenized_doc._.coref_clusters]

    # find quotes divided between sentences
    quotes_idx = [elem.idx for i, elem in enumerate(list(tokenized_doc)) if (elem.text in ['\'', '`'] and (i+1 != len(list(tokenized_doc))) and (elem.text == tokenized_doc[i+1].text)) or (elem.text == '\'\'') or (elem.text == "\"")]
    quotes_idx_clusters = [[quotes_idx[i], quotes_idx[i+1]] for i in range(0,len(quotes_idx),2)]




    # all words of the same sentence
    same_sent_idx_clusters = [[tkn.idx for tkn in tokenized_doc if get_sent_id(tkn)==i] for i in range(len(list(tokenized_doc.doc.sents)))]



    return quotes_idx_clusters , coref_chr_clusters + same_sent_idx_clusters



def main(args):
    indir = args.indir
    outdir = args.outdir

    nlp = spacy.load('en_core_web_sm')
    neuralcoref.add_to_pipe(nlp)
    json_lines = dict()
    pbar = tqdm(desc="files", total = len([file for root, subdirs, files in os.walk(indir) for file in files if file != "desktop.ini" and os.path.basename(root)!='summaries']))
    for root, subdirs, files in os.walk(indir):
        if files: # got to files rather than sub-directories
            if os.path.basename(root) == 'summaries':
                continue
            for file in files:
                # if not file == "NYT20000213.0130":
                #     continue
                doc_name = file
                if file.endswith('.csv') or file.endswith('.xlsx') or file == "desktop.ini":
                    continue
                # print(f"now on: {file}")
                with open(os.path.join(root, file), 'r', encoding='utf-8') as f1:
                    doc_content = f1.read()
                try:
                    tokenized_doc = nlp(doc_content)
                    quotes_coref_clusters, non_quotes_coref_clusters = paragraph_division(tokenized_doc)
                    json_lines[doc_name] = {"non_quotes_coref_clusters": non_quotes_coref_clusters, "quotes_coref_clusters":quotes_coref_clusters}
                except IndexError as e:
                    print(f"problem in doc {file}. The error:{e}")
                pbar.update(1)
    pbar.close()
    json_objects = json.dumps(json_lines)
    with open(os.path.join(outdir, "coref_clusters.json"), "w") as outfile:
        json_output = json_objects
        outfile.write(json_output)


    print("done")

if __name__ == "__main__":
    argparser = argparse.ArgumentParser(description="")
    argparser.add_argument("-i", "--indir", required=True, help="path to directory with docs and summaries (saved as a/file1, file2,... b/file1, file2, ... summaries/a,b,...")
    argparser.add_argument("-o", "--outdir", required=True, help="path to output dir where coref or quotation cluster will be saved (absolute chars)")
    main(argparser.parse_args())


