
import argparse
import json
import os
import spacy
import pandas as pd
import numpy as np
import csv
from difflib import SequenceMatcher
from tqdm import tqdm

# MEANINGLESS_POS = ['AUX', 'MD', 'BES', 'PUNCT', 'SPACE']
# MEANINGLESS_DEP = ['aux', 'auxpass']
# MEANINGLESS_LEMMAS = ['the', 'a', 'an', 'by']

IMPORTANT_POS = ['ADJ', 'ADV', 'NOUN', 'NUM', 'PROPN', 'VERB']
STR_RESEMBLANCE_THR = 0.86
MIN_PARAGRAPH_LENGTH=3

def check_matching(summary_tkn, doc_tkn):
    # if (summary_tkn.text == "stays" and doc_tkn.text == "said"):
    #     print("gotcha")
    return SequenceMatcher(None, summary_tkn.lemma_, doc_tkn.lemma_).ratio() >= STR_RESEMBLANCE_THR
    # return doc_tkn.lemma_ == summary_lemma and not doc_tkn.pos_ in MEANINGLESS_POS and not doc_tkn.dep_ in MEANINGLESS_DEP and not doc_tkn.lemma_ in MEANINGLESS_LEMMAS

def get_sent_id(tkn, isSummary):
    if isSummary: # for summaries there were cases where the sentences were divided in the middle - so simply decide sent_id based on how many new lines before.
        return len([elem for elem in tkn.doc if elem.text=="\n" and elem.i<tkn.i])
    else:
        sentence = [i for i, sent in enumerate(tkn.doc.sents) if sent == tkn.sent]
        if len(sentence) > 1:
            print("ERROR: identical sentences!")
            exit()
        return sentence[0]

def get_matches(summary_tkn, full_doc, doc_name, summary_name):
    # if summary_tkn.pos_ in MEANINGLESS_POS or summary_tkn.dep_ in MEANINGLESS_DEP or summary_tkn.lemma_ in MEANINGLESS_LEMMAS:
    #     return [], []
    doc_matching_tokens = [elem for elem in full_doc if check_matching(summary_tkn,elem)]
    if not doc_matching_tokens: # no matches
        return [], []

    all_alignment_dicts = []
    for doc_tkn in doc_matching_tokens:
        curr_alignment_dict = {"docTokenInd": f"{str(doc_tkn.i)}",
                               "summaryTokenInd": f"{str(summary_tkn.i)}",
                               "docTokenOffsets": f"{str(doc_tkn.idx)}, {str(doc_tkn.idx + len(doc_tkn.text))}",
                               "summaryTokenOffsets": f"{str(summary_tkn.idx)}, {str(summary_tkn.idx + len(summary_tkn.text))}",
                               "docTokenText": doc_tkn.text,
                               "summaryTokenText": summary_tkn.text}
        all_alignment_dicts.append(curr_alignment_dict)


    important_alignment_dicts = all_alignment_dicts.copy() if summary_tkn.pos_ in IMPORTANT_POS else []
    return all_alignment_dicts, important_alignment_dicts

def get_json_dicts(doc_elem, isSummary):
    # return [{"tkn_id": i, "sent_id": get_sent_id(tkn, isSummary), "word": tkn.text, "lemma": tkn.lemma_, "pos": tkn.pos_, "dep": tkn.dep_}
    #         for i, tkn in enumerate(doc_elem)]
    return [{"tkn_id": i, "sent_id": get_sent_id(tkn, isSummary), "word": tkn.text} for i, tkn in enumerate(doc_elem)]

def get_all_matches(doc_path, summary_path, doc_name, summary_name, nlp):
    with open(doc_path, 'r', encoding='utf-8') as f1:
        doc_content = f1.read()
    with open(summary_path, 'r', encoding='utf-8') as f1:
        summary_content = f1.read()

    tokenized_doc = nlp(doc_content)
    tokenized_summary = nlp(summary_content)

    all_matches_dict, important_matches_dict = [], []
    for i, tkn in enumerate(tokenized_summary):
        curr_all_matches, curr_important_matches = get_matches(tkn, tokenized_doc, doc_name, summary_name)
        all_matches_dict += curr_all_matches
        important_matches_dict += curr_important_matches

    return all_matches_dict, important_matches_dict, get_json_dicts(tokenized_doc, False), get_json_dicts(tokenized_summary, True), tokenized_doc, tokenized_summary

def get_lemma_match_mtx(matches_dict, doc_len, summary_len):
    lemma_match_mtx = np.zeros([doc_len, summary_len])
    for line in matches_dict:
        lemma_match_mtx[int(line['docTokenInd'])][int(line['summaryTokenInd'])]=1
    return lemma_match_mtx
    # return [list(row) for row in lemma_match_mtx]


def get_final_match_mtx(all_lemma_match_mtx, important_lemma_match_mtx):
    """

    :param all_lemma_match_mtx: all matches, including non-important words
    :param important_lemma_match_mtx: only important words matchings
    :return: mtx where all important words and also non-important words when a part of a n-gram with n>1 and that includes at least one important word
    """
    diagonals = dict()
    cnt = 0

    for i in range(all_lemma_match_mtx.shape[0]):
        for j in range(all_lemma_match_mtx.shape[1]):
            if all_lemma_match_mtx[i][j] == 1:
                diag_i, diag_j = i, j
                diagonals[cnt] = []
                while (diag_i < all_lemma_match_mtx.shape[0] and diag_j < all_lemma_match_mtx.shape[1] and all_lemma_match_mtx[diag_i][
                    diag_j] == 1):
                    diagonals[cnt].append((diag_i, diag_j))
                    diag_i += 1
                    diag_j += 1
                cnt += 1

    # leave only the longests diagonals
    diagonals_filtered = []
    for diag1 in diagonals.values():
        isSubDiag = False
        for diag2 in diagonals.values():
            if set(diag1).issubset(set(diag2)) and len(diag1) < len(diag2):
                isSubDiag = True
                break
        if not isSubDiag:
            diagonals_filtered.append(diag1)

    # get only diagonals that have at least one important word
    important_matches = [(i, j) for i in range(important_lemma_match_mtx.shape[0]) for j in range(important_lemma_match_mtx.shape[1]) if important_lemma_match_mtx[i][j] == 1]
    diagonals_final = [diag for diag in diagonals_filtered if any(elem in important_matches for elem in diag)]

    final_lemma_match_mtx = np.zeros_like(all_lemma_match_mtx)
    for diag in diagonals_final:
        for ind in diag:
            final_lemma_match_mtx[ind[0], ind[1]] = 1

    return  [list(row) for row in final_lemma_match_mtx]


def get_sent_id_based_on_idx(idx, tokenized_doc):
    sentence = [i for tkn in tokenized_doc for i, sent in enumerate(tokenized_doc.sents) if tkn.idx==idx and sent == tkn.sent]
    if len(sentence) > 1:
        print("ERROR: identical sentences!")
        exit()
    return sentence[0]

def further_merge_quotes_cluster(tokenized_doc, coref_cluster, sent_paragraph_breaks):
    quotes_coref_clusters_sent_ids = [[get_sent_id_based_on_idx(idx_a, tokenized_doc), get_sent_id_based_on_idx(idx_b, tokenized_doc)] for
                                      idx_a, idx_b in coref_cluster['quotes_coref_clusters']]

    further_merge_clusters = []
    for quotes_sent_ids in quotes_coref_clusters_sent_ids:
        min_quotes_sent_id, max_quotes_sent_id = -1, -1
        for i, sent_id in enumerate(sent_paragraph_breaks):
            min_sent_id = 0 if i == 0 else sent_paragraph_breaks[i - 1]
            max_sent_id = sent_id
            if quotes_sent_ids[0] in list(range(min_sent_id + 1, max_sent_id + 1)) and not quotes_sent_ids[1] in list(
                    range(min_sent_id, max_sent_id + 1)):
                min_quotes_sent_id = min_sent_id
            if quotes_sent_ids[1] in list(range(min_sent_id + 1, max_sent_id + 1)) and not quotes_sent_ids[0] in list(
                    range(min_sent_id, max_sent_id + 1)):
                max_quotes_sent_id = max_sent_id
        if min_quotes_sent_id != -1 and max_quotes_sent_id != -1:
            further_merge_clusters.append([min_quotes_sent_id, max_quotes_sent_id])
        elif min_quotes_sent_id != -1 and max_quotes_sent_id == -1: # the closing quote is in the final paragaraph whereas the opening quote is not
            further_merge_clusters.append([min_quotes_sent_id, 1000000000])
        elif min_quotes_sent_id == -1 and max_quotes_sent_id != -1: # the opening quote is in the first paragaraph whereas the closing quote is not
            further_merge_clusters.append([0, max_quotes_sent_id])

    if further_merge_clusters:
        further_merged_sent_paragraph_breaks = [set([elem for elem in sent_paragraph_breaks if not (elem > further_merge_spans[0] and elem < further_merge_spans[1])]) for further_merge_spans in further_merge_clusters]
        further_merged_sent_paragraph_breaks = list(set.intersection(*further_merged_sent_paragraph_breaks))
        further_merged_sent_paragraph_breaks.sort()
        return further_merged_sent_paragraph_breaks
    return sent_paragraph_breaks



def get_paragraph_breaks_in_sent_ids(coref_cluster, tokenized_doc):
    coref_cluster_chr = coref_cluster["quotes_coref_clusters"] + coref_cluster["non_quotes_coref_clusters"]
    sent_id_clusters = []
    for cluster in coref_cluster_chr:
        new_cluster = []
        for idx in cluster:
            new_cluster = new_cluster + [get_sent_id(elem, False) for elem in list(tokenized_doc) if elem.idx == idx]
        sent_id_clusters.append(new_cluster)
    sent_id_clusters = [set(elem) for elem in sent_id_clusters]

    # union-merge the clusters into a unified version
    merged_clusters = []
    for elem in sent_id_clusters:
        clusters_to_join = [cluster for cluster in merged_clusters if cluster.intersection(elem)] + [elem]
        merged_clusters = [cluster for cluster in merged_clusters if not cluster in clusters_to_join]
        merged_clusters = merged_clusters + [set().union(*clusters_to_join)]
    merged_clusters = [list(cluster) for cluster in merged_clusters]



    # find sent_i list where the paragaraph breaks will occur
    doc_len = len(list(tokenized_doc.doc.sents))
    sent_paragraph_breaks = []

    sent_cnt_per_paragraph = 0
    for sent_i in range(doc_len - 1):
        if sent_cnt_per_paragraph >= MIN_PARAGRAPH_LENGTH - 1:
            common_clusters = [cluster for cluster in merged_clusters if sent_i in cluster and sent_i + 1 in cluster]
            # next sent is connected to curr sent
            if common_clusters:
                sent_cnt_per_paragraph += 1
            # next sent is not connected to curr sent
            else:
                sent_cnt_per_paragraph = 0
                sent_paragraph_breaks.append(sent_i)
        else:
            sent_cnt_per_paragraph += 1
    if sent_cnt_per_paragraph < MIN_PARAGRAPH_LENGTH:
        sent_paragraph_breaks=sent_paragraph_breaks[:-1] # if last "paragarph" is too short - merge it with the previous one.


    # make sure a long quote, spreading over several sentences, is not separated into different paragraphs.
    sent_paragraph_breaks = further_merge_quotes_cluster(tokenized_doc, coref_cluster, sent_paragraph_breaks)

    # sent_paragraph_breaks indicates after which sent_i to start new paragraph. tkn_paragraph_breaks is those sent_i's last tkn_i, after which a new paragraph should begin
    tkn_paragraph_breaks = [max([tkn.i for tkn in tokenized_doc if get_sent_id(tkn, False)==p_breaks]) for p_breaks in sent_paragraph_breaks]
    return tkn_paragraph_breaks





def main(args):
    indir = args.indir
    outdir = args.outdir
    coref_cluster_json_path = args.coref_cluster_json


    with open(coref_cluster_json_path) as f1:
        coref_clusters_chr = json.loads(f1.read())



    nlp = spacy.load('en_core_web_sm')
    json_lines = dict()
    id=0
    pbar = tqdm(desc="files", total = len([file for root, subdirs, files in os.walk(indir) for file in files if file != "desktop.ini" and os.path.basename(root)!='summaries']))

    for root, subdirs, files in os.walk(indir):
        if files: # got to files rather than sub-directories
            if os.path.basename(root) == 'summaries':
                continue
            for file in files:
                # if file == "APW19981114.0178":
                #     continue
                if file.endswith('.csv') or file.endswith('.xlsx') or file == "desktop.ini":
                    continue
                doc_name = file
                summary_name = os.path.basename(root)
                doc_path = os.path.join(root, file)
                summary_path = root.replace(summary_name, os.path.join('summaries', summary_name))
                all_matches_dict, important_matches_dict, doc_jsons, summary_jsons, tokenized_doc, tokenized_summary = get_all_matches(doc_path, summary_path, doc_name, summary_name, nlp)
                all_lemma_match_mtx = get_lemma_match_mtx(all_matches_dict, len(doc_jsons), len(summary_jsons))
                important_lemma_match_mtx = get_lemma_match_mtx(important_matches_dict, len(doc_jsons), len(summary_jsons))

                final_lemma_match_mtx = get_final_match_mtx(all_lemma_match_mtx, important_lemma_match_mtx)
                important_lemma_match_mtx =  [list(row) for row in important_lemma_match_mtx]

                doc_paragraph_breaks = get_paragraph_breaks_in_sent_ids(coref_clusters_chr[doc_name], tokenized_doc)
                json_lines[str(id)] = {"doc": doc_jsons, "summary": summary_jsons, "all_lemma_match_mtx": final_lemma_match_mtx, "important_lemma_match_mtx": important_lemma_match_mtx, "doc_paragraph_breaks": doc_paragraph_breaks, "summary_name":summary_name, "doc_name":doc_name}
                id+=1
                pbar.update(1)
    pbar.close()
    # json_objects = [json.dumps(json_line) for json_line in json_lines]
    json_objects = json.dumps(json_lines)
    with open(os.path.join(outdir, "data_for_mturk.json"), "w") as outfile:
        # json_output = "\n".join(json_objects)
        json_output = json_objects
        outfile.write(json_output)
    # with open(os.path.join(outdir, "data_for_mturk.csv"), "w", encoding='utf-8', newline='') as f:
    #     writer = csv.writer(f)
    #
    #     # write the header
    #     writer.writerow(['id', 'json'])
    #
    #     # write multiple rows
    #     csv_output = [[i,json_object] for i,json_object in enumerate(json_objects)]
    #     writer.writerows(csv_output)


    print("done")

if __name__ == "__main__":
    argparser = argparse.ArgumentParser(description="")
    argparser.add_argument("-i", "--indir", required=True, help="path to directory with docs and summaries (saved as a/file1, file2,... b/file1, file2, ... summaries/a,b,...")
    argparser.add_argument("-o", "--outdir", required=True, help="path to output dir where data_for_mturk.json and data_for_mturk.csv will be saved")
    argparser.add_argument("--coref-cluster-json", required=True, help="path to coref cluster json (chars)")
    main(argparser.parse_args())


