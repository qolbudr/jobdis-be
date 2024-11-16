'use client'

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { InterestTable } from "@/components/Table/InterestTable";
import { QuestionTable } from "@/components/Table/QuestionTable";
import { Exception } from "@/types/exception";
import { ApiMethod, apiV1 } from "@/utils/api";
import { Anchor, Breadcrumbs, Button, Grid, GridCol, Group, Modal, Radio, Text, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { InterestTest, MappingQuestion } from "@prisma/client";
import { JsonArray } from "@prisma/client/runtime/library";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const MappingPage = () => {
  const [data, setData] = useState<Array<MappingQuestion>>([]);
  const [interest, setInterest] = useState<Array<InterestTest>>([]);
  const [questionDetail, setQuestion] = useState<MappingQuestion | undefined>();
  const [interestDetail, setInterestDetail] = useState<InterestTest | undefined>();
  const [selectedId, setId] = useState<string | undefined>();
  const [confirmDeleteOpen, openConfirmDelete] = useState(false);
  const [confirmDeleteInterestOpen, openConfirmDeleteInterest] = useState(false);
  const [editModalOpen, openEditModal] = useState(false);
  const [editModalInterestOpen, openEditModalInterest] = useState(false);

  useEffect(() => {
    getData();
  }, [])

  const getData = async () => {
    try {
      const mapping = await apiV1<Array<MappingQuestion>>({ path: '/api/mappings', method: ApiMethod.GET });
      const interest = await apiV1<Array<InterestTest>>({ path: '/api/interests', method: ApiMethod.GET });
      setData(mapping!);
      setInterest(interest!);
    } catch (e) {
      const exception = e as Exception;

      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setQuestion({ ...questionDetail!, [name]: value })
  }

  const handleChangeInterest = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setInterestDetail({ ...interestDetail!, [name]: value })
  }

  const handleRadio = (value: string, index: number) => {
    let category = questionDetail?.category as JsonArray;
    category[index] = value;
    setQuestion({ ...questionDetail!, category: category })
  }

  const handleRadioInterest = (value: string) => {
    setInterestDetail({ ...interestDetail!, category: value })
  }

  const handleSubmitEdit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await apiV1<MappingQuestion>({ path: `/api/mapping/${selectedId}`, method: ApiMethod.POST, body: questionDetail });
      openEditModal(false);
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "Question has been updated",
        position: 'top-center'
      })
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const handleSubmitEditInterest = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await apiV1<InterestTest>({ path: `/api/interest/${interestDetail?.id}`, method: ApiMethod.POST, body: interestDetail });
      openEditModalInterest(false);
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "Interest Question has been updated",
        position: 'top-center'
      })
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const actionDelete = (id: number) => {
    setId(id.toString());
    openConfirmDelete(true)
  }

  const actionDeleteInterest = (id: number) => {
    setId(id.toString());
    openConfirmDeleteInterest(true)
  }

  const deleteQuestion = async () => {
    try {
      const user = await apiV1<MappingQuestion>({ path: `/api/mapping/${selectedId}`, method: ApiMethod.DELETE });
      openConfirmDelete(false)
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "Question has been deleted",
        position: 'top-center'
      })
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const deleteQuestionInterest = async () => {
    try {
      const user = await apiV1<InterestTest>({ path: `/api/interest/${selectedId}`, method: ApiMethod.DELETE });
      openConfirmDeleteInterest(false)
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "Interest Question has been deleted",
        position: 'top-center'
      })
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }
  
  const actionEdit = async (id: number) => {
    try {
      setId(id.toString());
      const response = await apiV1<MappingQuestion>({ method: ApiMethod.GET, path: `/api/mapping/${id}` });
      setQuestion(response);
      openEditModal(true)
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  const actionEditData = async (id: number) => {
    try {
      setId(id.toString());
      const response = await apiV1<InterestTest>({ method: ApiMethod.GET, path: `/api/interest/${id}` });
      setInterestDetail(response);
      openEditModalInterest(true)
    } catch (e) {
      const exception = e as Exception;
      notifications.show({
        color: 'red',
        title: exception.title,
        message: JSON.stringify(exception.error) ?? exception.message,
        position: 'top-center'
      })
    }
  }

  return <>
    <PageContainer title="Question">
      <Modal opened={editModalOpen} onClose={() => openEditModal(false)} size='lg' title="Edit Question" centered>
        <form onSubmit={handleSubmitEdit}>
          <Textarea name="first" onChange={handleChange} placeholder="Question A" label="Question A" value={questionDetail?.first} required></Textarea>
          {
            questionDetail ?
              <Group my="md">
                <Radio onClick={() => handleRadio("I", 0)} value="I" label="Introvert" checked={(questionDetail?.category as JsonArray)[0] == "I"} />
                <Radio onClick={() => handleRadio("S", 0)} value="S" label="Sensing" checked={(questionDetail?.category as JsonArray)[0] == "S"} />
                <Radio onClick={() => handleRadio("T", 0)} value="T" label="Thinking" checked={(questionDetail?.category as JsonArray)[0] == "T"} />
                <Radio onClick={() => handleRadio("J", 0)} value="J" label="Judging" checked={(questionDetail?.category as JsonArray)[0] == "J"} />
                <Radio onClick={() => handleRadio("E", 0)} value="E" label="Extrovert" checked={(questionDetail?.category as JsonArray)[0] == "E"} />
                <Radio onClick={() => handleRadio("N", 0)} value="N" label="Intuition" checked={(questionDetail?.category as JsonArray)[0] == "N"} />
                <Radio onClick={() => handleRadio("F", 0)} value="F" label="Feeling" checked={(questionDetail?.category as JsonArray)[0] == "F"} />
                <Radio onClick={() => handleRadio("P", 0)} value="P" label="Perceiving" checked={(questionDetail?.category as JsonArray)[0] == "P"} />
              </Group> : <></>
          }
          <Textarea name="second" onChange={handleChange} placeholder="Question B" label="Question B" value={questionDetail?.second} required></Textarea>
          {
            questionDetail ?
              <Group my="md">
                <Radio onClick={() => handleRadio("I", 1)} value="I" label="Introvert" checked={(questionDetail?.category as JsonArray)[1] == "I"} />
                <Radio onClick={() => handleRadio("S", 1)} value="S" label="Sensing" checked={(questionDetail?.category as JsonArray)[1] == "S"} />
                <Radio onClick={() => handleRadio("T", 1)} value="T" label="Thinking" checked={(questionDetail?.category as JsonArray)[1] == "T"} />
                <Radio onClick={() => handleRadio("J", 1)} value="J" label="Judging" checked={(questionDetail?.category as JsonArray)[1] == "J"} />
                <Radio onClick={() => handleRadio("E", 1)} value="E" label="Extrovert" checked={(questionDetail?.category as JsonArray)[1] == "E"} />
                <Radio onClick={() => handleRadio("N", 1)} value="N" label="Intuition" checked={(questionDetail?.category as JsonArray)[1] == "N"} />
                <Radio onClick={() => handleRadio("F", 1)} value="F" label="Feeling" checked={(questionDetail?.category as JsonArray)[1] == "F"} />
                <Radio onClick={() => handleRadio("P", 1)} value="P" label="Perceiving" checked={(questionDetail?.category as JsonArray)[1] == "P"} />
              </Group> : <></>
          }
          <Button mt='xl' fullWidth={true} type="submit">Save</Button>
        </form>
      </Modal>

      <Modal opened={editModalInterestOpen} onClose={() => openEditModalInterest(false)} size='lg' title="Edit Interest Question" centered>
        <form onSubmit={handleSubmitEditInterest}>
          <Textarea name="statement" onChange={handleChangeInterest} placeholder="Statement" label="Statement" value={interestDetail?.statement} required></Textarea>
          {
            interestDetail ?
              <Group my="md">
                <Radio onClick={() => handleRadioInterest("Linguistic")} value="Linguistic" label="Linguistic" checked={interestDetail?.category == "Linguistic"} />
                <Radio onClick={() => handleRadioInterest("Logical-Mathematical")} value="Logical-Mathematical" label="Logical-Mathematical" checked={interestDetail?.category == "Logical-Mathematical"} />
                <Radio onClick={() => handleRadioInterest("Visual-Spatial")} value="Visual-Spatial" label="Visual-Spatial" checked={interestDetail?.category == "Visual-Spatial"} />
                <Radio onClick={() => handleRadioInterest("Kinesthetic")} value="Kinesthetic" label="Kinesthetic" checked={interestDetail?.category == "Kinesthetic"} />
                <Radio onClick={() => handleRadioInterest("Musical")} value="Musical" label="Musical" checked={interestDetail?.category == "Musical"} />
                <Radio onClick={() => handleRadioInterest("Interpersonal")} value="Interpersonal" label="Interpersonal" checked={interestDetail?.category == "Interpersonal"} />
                <Radio onClick={() => handleRadioInterest("Intrapersonal")} value="Intrapersonal" label="Intrapersonal" checked={interestDetail?.category == "Intrapersonal"} />
                <Radio onClick={() => handleRadioInterest("Naturalistic")} value="Naturalistic" label="Naturalistic" checked={interestDetail?.category == "Naturalistic"} />
              </Group> : <></>
          }
          <Button mt='xl' fullWidth={true} type="submit">Save</Button>
        </form>
      </Modal>

      <Modal opened={confirmDeleteOpen} onClose={() => openConfirmDelete(false)} title="Delete User" centered>
        <Text>Are you sure wanna delete this question?</Text>
        <Group mt="xl" justify="right">
          <Button color="red" onClick={() => deleteQuestion()}>Delete</Button>
          <Button variant="outline" onClick={() => openConfirmDelete(false)} type="submit">Cancel</Button>
        </Group>
      </Modal>

      <Modal opened={confirmDeleteInterestOpen} onClose={() => openConfirmDeleteInterest(false)} title="Delete User" centered>
        <Text>Are you sure wanna delete this interest question?</Text>
        <Group mt="xl" justify="right">
          <Button color="red" onClick={() => deleteQuestionInterest()}>Delete</Button>
          <Button variant="outline" onClick={() => openConfirmDeleteInterest(false)} type="submit">Cancel</Button>
        </Group>
      </Modal>

      <Grid>
        <GridCol className="text-left" span={12}>
          <Breadcrumbs>
            <Anchor href="/dashboard">
              Dashboard
            </Anchor>
            <Anchor href="/dashboard/mapping">
              Mapping
            </Anchor>
          </Breadcrumbs>
        </GridCol>
        <GridCol span={12}>
          <QuestionTable data={data} deleteQuestion={actionDelete} editQuestion={actionEdit} />
        </GridCol>
        <GridCol span={12}>
          <InterestTable data={interest} deleteData={actionDeleteInterest} editData={actionEditData} />
        </GridCol>
      </Grid>
    </PageContainer>

  </>
}

export default MappingPage;