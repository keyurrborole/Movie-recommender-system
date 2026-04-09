# import csv
# with open("./TMDB_movie_dataset_v11.csv", "r", encoding="utf-8") as file,open("./final_dataset.csv", "w", encoding="utf-8",newline="") as output_file:
#     input_reader = csv.reader(file)
#     output_writer = csv.writer(output_file)

#     for index, row in enumerate(input_reader):
#         if index >=10001:
#             break
#         output_writer.writerow(row)



import csv
with open("./TMDB_movie_dataset_v11.csv", "r", encoding="utf-8") as file,open("./2026_movies.csv", "w", encoding="utf-8",newline="") as output_file:
    input_reader = csv.reader(file)
    output_writer = csv.writer(output_file)

    for row in input_reader:
        if row[5].startswith("2026"):
            output_writer.writerow(row)


# import csv 
# genres=[]
# with open("./final_dataset.csv","r",encoding="utf-8") as file:
#     reader = csv.reader(file)
#     for row in reader:
#         gen= row[19].split(",")
#         genres.extend(([g.strip() for g in gen if g.strip() not in genres and g.strip() != ""]))
        
# print(genres)